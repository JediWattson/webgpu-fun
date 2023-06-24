"use client";

import React, { useRef, useState } from "react";

import { usePlayerContext } from "@/app/context/player";
import { useRouter } from "next/navigation";

import Button from "../button";
import Textarea from "../textarea";
import DialogueBox, { DialogueType } from "../dialogue-box";

import { postOracle } from "./lib";

import styles from "./style.module.css";

type ChatPropsType = {
  gamePath: string;
  gameSpeaker: string;
  gameData: {
    isStarted: boolean;
    playerId: string;
    messages: DialogueType;
  };
};
const Chat = ({ gameData, gamePath, gameSpeaker }: ChatPropsType) => {
  const [oracleSays, setOracle] = useState(gameData.messages);

  const textValueRef = useRef<HTMLTextAreaElement>(null);
  const handleClick = async () => {
    if (!textValueRef.current) return;

    const playerText = textValueRef.current.value.trim();
    if (playerText === "") return;
    textValueRef.current.value = "";

    const newText = { text: playerText, speaker: gameSpeaker };
    const newChat = [...oracleSays, newText];
    setOracle(newChat);
    const message = await postOracle(gamePath, playerText);
    setOracle([...newChat, message]);
  };

  const handleKeyUp = ({ key }: { key: string }) => {
    if (key === "Enter") handleClick();
  };

  const router = useRouter();
  const handleEndGame = async () => {
    try {
      const res = await fetch(`/game/${gamePath}/api`, { method: "DELETE" });

      // TODO: add some error handling
      const data = await res.json();
      setIsExpanded(false);
      await router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const { player } = usePlayerContext();
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <DialogueBox dialogue={oracleSays} gameSpeaker={gameSpeaker} />
      {gameData.playerId === player?._id && gameData.isStarted && (
        <div className={styles.actions}>
          {isExpanded ? (
            <Button onClick={handleEndGame} text="End Game" />
          ) : (
            <Button onClick={() => setIsExpanded(true)} text="Opts >>" />
          )}

          <Textarea
            onFocus={() => setIsExpanded(false)}
            handleKeyUp={handleKeyUp}
            textValueRef={textValueRef}
            className={styles.textarea}
          />
          <Button onClick={handleClick} text="Send" />
        </div>
      )}
    </>
  );
};

export default Chat;
