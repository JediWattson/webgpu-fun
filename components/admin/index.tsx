"use client";

import { GameMetaType } from "@/db/mongo/collections/gamesMeta";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "../button";
import Select from "../select";
import GameForm from "./game-form";

import style from "./style.module.css";

const useAdminData = () => {
  const [adminData, setAdminData] = useState<{ metaData?: GameMetaType[] }>({});
  const router = useRouter();

  const getAdminDataRef = useRef(false);
  useEffect(() => {
    if (getAdminDataRef.current) return;
    const getAdminData = async () => {
      const res = await fetch("/admin/data/api");
      const data = await res.json();
      if (data.unauthorized) router.push("/");
      setAdminData(data);
    };
    getAdminData();
  }, []);
  return adminData;
};

const Admin = () => {
  const adminData = useAdminData();

  const [isAddEvent, setIsAddEvent] = useState(false);

  const [isEditEvent, setIsEditEvent] = useState(false);
  const [editGame, setEditGame] = useState<GameMetaType | undefined>();
  const handleChange = (value: string) => {
    const game = adminData?.metaData?.find((g) => g.gameKey === value);
    setEditGame(game);
  };
  const mapData = (data: GameMetaType) => ({
    value: data.gameKey,
    label: data.title,
  });

  useEffect(() => {
    if (editGame || !adminData?.metaData?.length) return;
    handleChange(adminData?.metaData[0].gameKey);
  }, [adminData?.metaData]);

  const handleClose = () => {
    setIsEditEvent(false);
    setIsAddEvent(false);
    setEditGame(undefined);
  };

  return (
    <>
      <div className={style.adminContainer}>
        <h2>Admin</h2>
        <div className={style.gamesMetaActions}>
          <Button onClick={() => setIsAddEvent(true)} text="Add Game" />
          <div className={style.editMetaAction}>
            <Select
              dataArr={adminData?.metaData}
              mapCallback={mapData}
              onChange={handleChange}
            />
            <Button onClick={() => setIsEditEvent(true)} text="Edit Game" />
          </div>
        </div>
      </div>
      {(isAddEvent || (isEditEvent && editGame)) && (
        <GameForm gameData={isEditEvent ? editGame : undefined} onClose={handleClose} />
      )}
    </>
  );
};

export default Admin;
