import { Fragment } from "react";

// speechSynthesis.speak(new SpeechSynthesisUtterance(data.text));

import style from "./style.module.css";

export type DialogueType = { speaker: string; text: string }[];
type DialogueBoxPropsType = { dialogue: DialogueType; gameSpeaker: string };

const DialogueBox = ({ dialogue, gameSpeaker }: DialogueBoxPropsType) => {
  const handleRef = (ref: HTMLDivElement) => {
    if (!ref) return;
    ref.scrollTop = ref.scrollHeight;
  };

  return (
    <div ref={handleRef} className={style.textBox}>
      {dialogue.map(({ speaker, text }, i) => (
        <div key={i} className={style.message}>
          <h4 className={style.h4}>{speaker}</h4>
          <div
            className={` ${style.bubble} ${
              speaker === gameSpeaker ? style.gameSpeaker : ""
            }`}
          >
            <p className={style.p}>{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DialogueBox;
