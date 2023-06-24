import Image from "next/image";
import Button, { ButtonPropsType } from "../button";
import { shimmer, toBase64 } from "./lib";

import style from "./style.module.css";

function Card({
  img,
  title,
  subtitle,
  footer,
  buttonProps,
}: {
  title: string;
  subtitle?: string;
  footer?: { title: string; subtitle: string | string[] };
  img?: { src: string; alt: string; height: number; width: number };
  buttonProps?: ButtonPropsType;
}) {
  return (
    <div className={style.cardContainer}>
      <h1>{title}</h1>
      {subtitle && <h4>{subtitle}</h4>}
      {img && (
        <Image
          className={style.cardImg}
          height={img.height}
          width={img.width}
          src={img.src}
          alt={img.alt}
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(
            shimmer(img.height, img.width)
          )}`}
        />
      )}
      {buttonProps && (
        <Button
          text={buttonProps.text}
          onClick={buttonProps.onClick}
          disabled={buttonProps.disabled}
        />
      )}
      {footer && (
        <>
          <h2>{footer.title}</h2>
          {Array.isArray(footer.subtitle) ? (
            footer.subtitle.map((text) => <p key={text}>{text}</p>)
          ) : (
            <p>{footer.subtitle}</p>
          )}
        </>
      )}
    </div>
  );
}

export default Card;
