"use client";

import Portal from "../portal";

import style from "./style.module.css";

export default function Modal({ children }: { children: React.ReactNode }) {
  return (
    <Portal elementId="modal">
      <div className={style.pageContainer}>
        <div className={style.modalContainer}>{children}</div>
      </div>
    </Portal>
  );
}
