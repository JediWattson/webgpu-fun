import React, { KeyboardEventHandler, Ref, SyntheticEvent } from "react";

import styles from "./style.module.css";

const Textarea = ({
  textValueRef,
  className = "",
  handleKeyUp,
  onFocus,
}: {
  textValueRef: Ref<HTMLTextAreaElement>;
  className: string;
  handleKeyUp?: KeyboardEventHandler<HTMLTextAreaElement>;
  onFocus: () => void;
}) => {
  return (
    <textarea
      onFocus={onFocus}
      ref={textValueRef}
      onKeyUp={handleKeyUp && handleKeyUp}
      className={`${className} ${styles.textareaContainer}`}
    />
  );
};

export default Textarea;
