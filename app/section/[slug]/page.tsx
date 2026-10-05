// Unreachable — middleware redirects to /[locale]/section/[slug]
import { redirect } from "next/navigation";
export default function Page({ params }: { params: { slug: string } }) {
  redirect(`/hy/section/${params.slug}`);
}
