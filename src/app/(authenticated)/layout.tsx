import { isAuthenticated } from "@/lib/is-authenticated";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const isAuthed = await isAuthenticated();

  if (!isAuthed) {
    redirect("/login");
  }

  return <>{children}</>;
};

export default Layout;
