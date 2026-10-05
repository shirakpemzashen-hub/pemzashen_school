// Unreachable — middleware redirects to /[locale]/section/[slug]/[childSlug]
import { redirect } from "next/navigation";
export default function Page({ params }: { params: { slug: string; childSlug: string } }) {
  redirect(`/hy/section/${params.slug}/${params.childSlug}`);
}
