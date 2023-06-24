import style from "./style.module.css";

export type ButtonPropsType = {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  large?: boolean;
  small?: boolean;
};

function Button({ large, text, onClick, disabled, small }: ButtonPropsType) {
  return (
    <button
      disabled={disabled}
      className={`${style.buttonContainer} ${small ? style.small : ""} ${
        disabled ? style.disabled : ""
      } ${large ? style.large : ""}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Button;
