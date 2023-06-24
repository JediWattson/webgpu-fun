import { useRef, Ref, useReducer } from "react";

import Button from "../button";
import Input from "../input";
import Modal from "../modal";

import style from "./style.module.css";

const gameKeys = [
  { value: "gameKey", label: "Game Key" },
  { value: "title", label: "Title" },
  { value: "description", label: "Description", textArea: true },
  { value: "narrator", label: "Narrator" },
  { value: "speaker", label: "Speaker" },
  { value: "backstory", label: "Backstory", textArea: true },
];

const reducer = (
  state: { [key: string]: ModalInputRefType },
  action: { type: string; payload: { ref: ModalInputRefType; key: string } }
) => {
  switch (action.type) {
    case "set-ref":
      const { ref, key } = action.payload;
      return { ...state, [key]: ref };
  }
  return state;
};

type ModalInputRefType = HTMLInputElement & HTMLTextAreaElement;
const GameForm = ({
  gameData,
  onClose,
}: {
  gameData?: { [key: string]: string };
  onClose: () => void;
}) => {
  const [state, dispatch] = useReducer(reducer, {});

  const makeRef = (key: string) => (ref: ModalInputRefType) => {
    if (
      !ref ||
      (state[key] && !(gameData && gameData[key] !== "" && ref.value === ""))
    )
      return;
    if (gameData && gameData[key] !== "" && ref.value === "") {
      ref.value = gameData[key];
    }
    dispatch({
      type: "set-ref",
      payload: { ref, key },
    });
  };

  const handleSubmit = async () => {
    const reqObj = gameKeys.reduce((acc: { [key: string]: string }, game) => {
      const ref = state[game.value];
      if (ref.value === "") throw Error("Empty string found");
      if (
        gameData &&
        game.value !== "gameKey" &&
        gameData[game.value] === ref.value
      )
        return acc;

      acc[game.value] = ref.value;
      return acc;
    }, {});

    let action = "add-game";
    if (gameData) action = "edit-game";
    if (Object.keys(reqObj).length > 0) {
      await fetch(`/admin/${action}/api`, {
        method: "PUT",
        body: JSON.stringify(reqObj),
      });
    }
    onClose();
  };

  return (
    <Modal>
      <>
        <div className={style.modalContainer}>
          <h2>Create a new game!</h2>
          {gameKeys.map((g) => (
            <Input
              key={g.label}
              initValue={gameData && gameData[g.value]}
              label={g.label}
              inputRef={makeRef(g.value)}
              textArea={g.textArea}
            />
          ))}
        </div>
        <div className={style.modalButtons}>
          <Button text="Submit" onClick={handleSubmit} />
          <Button text="Close" onClick={onClose} />
        </div>
      </>
    </Modal>
  );
};

export default GameForm;
