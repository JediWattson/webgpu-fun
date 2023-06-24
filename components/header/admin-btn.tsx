import { useRouter } from "next/navigation";
import Button from "../button";

export default function AdminBtn() {
  const router = useRouter();
  return <Button small text="Admin" onClick={() => router.push("/admin")} />;
}
