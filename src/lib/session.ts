import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) {
    throw new Error("Not authorized");
  }
  return session.user;
}