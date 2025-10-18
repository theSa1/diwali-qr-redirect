import { cookies } from "next/headers";

export const isAuthenticated = async (): Promise<boolean> => {
  const cookieStore = await cookies();

  const authCode = cookieStore.get("auth-code");

  if (!authCode || authCode.value !== process.env.AUTH_CODE) {
    if (authCode) {
      cookieStore.delete("auth-code");
    }
    return false;
  }

  return true;
};
