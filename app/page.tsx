// This page is effectively unreachable — the next-intl middleware
// redirects all incoming requests (e.g. /) to the locale-prefixed path (/hy/).
// Kept as a minimal fallback.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/hy");
}
