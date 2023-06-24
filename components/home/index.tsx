import Link from "next/link";
import style from "./style.module.css";

type HomeGameType = { type: string; gameId: string; createdAt: string };
type HomePropsType = { games: HomeGameType[] };
export default function Home({ games }: HomePropsType) {
  return (
    <div className={style.homeContainer}>
      <h2>
        Welcome to <br />
        Infinite Text Adventures!
      </h2>
      <div className={style.linkContainer}>
        <h3>Check out some past games!</h3>
        {games.map(({ gameId, type, createdAt }: HomeGameType, i) => {
          const date = new Date(createdAt);
          return (
            <Link
              className={style.link}
              key={i}
              href={`/game/${type}/${gameId}`}
            >
              {`${date.toLocaleString()} ${type}`}
            </Link>
          );
        })}
      </div>
      <p>
        Send me{" "}
        <a
          className={style.link}
          href="mailto:feedback@infinitetextadventures.app"
        >
          an email
        </a>
      </p>
    </div>
  );
}
