"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";

import { usePlayerContext } from "@/app/context/player";

import Button from "@/components/button";
import AdminBtn from "./admin-btn";

import style from "./style.module.css";

function Header() {
  const playerCtx = usePlayerContext();
  const isSession = !!playerCtx.player;

  const handleSignout = () => {
    if (!playerCtx.clearPlayer) throw Error("Clear session is undefined");
    playerCtx.clearPlayer();
    signOut();
  };

  return (
    <nav className={style.header}>
      <h2 className={style.title}>
        <Link className={style.homeLink} href={isSession ? "/dashboard" : "/"}>
          {"ITA!"}
        </Link>
      </h2>
      <ul className={style.actions}>
        {playerCtx.player?.role === "admin" && (
          <li>
            <AdminBtn />
          </li>
        )}
        <li>
          <Button
            small
            text={`Sign ${isSession ? "Out" : "In"}`}
            onClick={
              isSession
                ? handleSignout
                : () => signIn(undefined, { callbackUrl: `/dashboard` })
            }
          />
        </li>
      </ul>
    </nav>
  );
}

export default Header;
