import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SiteShell } from "../components";
import { AdminPanel } from "./panel";
import { isAdminSession } from "../api/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Server-side auth check — env var available in server component
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const token = process.env.ADMIN_TOKEN;

  if (!isAdminSession(session, token)) {
    redirect("/admin/login");
  }

  return (
    <SiteShell>
      <section className="admin-hero">
        <p className="eyebrow">Admin</p>
        <h1>Նյութերի կառավարում</h1>
        <p>Ավելացնել, խմբագրել և հեռացնել նյութեր կայքի ցանկացած բաժնի համար։</p>
      </section>
      <AdminPanel />
    </SiteShell>
  );
}
