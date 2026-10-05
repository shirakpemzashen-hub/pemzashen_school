// Unreachable — middleware redirects to /[locale]/imported
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/hy/imported");
}
