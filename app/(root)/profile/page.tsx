import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) return redirect("/sign-in");

  return redirect(`/profile/${user.id}`);
}
