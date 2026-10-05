import { notFound } from "next/navigation";
import { Link } from "../../../../../i18n/navigation";
import { SiteShell } from "../../../../components";
import { sections } from "../../../../data";
import { UserMaterials } from "../../../../user-materials";

export const dynamic = "force-dynamic";

const PAGE_FEATURES: Record<
  string,
  {
    image?: string;
    heroImage?: string;
    hideHeroDescription?: boolean;
    alt?: string;
    title: string;
    text: string;
    href?: string;
    linkLabel?: string;
  }
> = {
  "staff/leadership": {
    image: "/director.jpg",
    alt: "Պեմզաշենի միջնակարգ դպրոցի տնօրեն",
    title: "Տնօրեն",
    text: "Պեմզաշենի միջնակարգ դպրոցի տնօրենությունը ղեկավարում է դպրոցի կրթական, կազմակերպչական և համայնքային աշխատանքները։",
  },
  "staff/teachers": {
    image: "/teaching-staff.jpg",
    heroImage: "/teaching-staff.jpg",
    hideHeroDescription: true,
    alt: "Պեմզաշենի միջնակարգ դպրոցի ուսուցչական անձնակազմ",
    title: "Ուսուցչական կազմ",
    text: "Պեմզաշենի միջնակարգ դպրոցի ուսուցչական անձնակազմը՝ միասին կրթական միջավայր ստեղծելու համար։",
  },
  "councils/student": {
    title: "Աշակերտական խորհուրդ",
    text: "Աշակերտական խորհրդի նորություններին և նախաձեռնություններին հետևեք իրենց պաշտոնական Facebook էջում։",
    href: "https://www.facebook.com/share/18UrwtpFjS/",
    linkLabel: "Բացել Facebook էջը",
  },
};

export function generateStaticParams() {
  return sections.flatMap((section) =>
    section.links.map((link) => ({
      slug: section.slug,
      childSlug: link.slug,
    })),
  );
}

export default async function ChildSectionPage({
  params,
}: {
  params: Promise<{ slug: string; childSlug: string; locale: string }>;
}) {
  const { slug, childSlug } = await params;
  const section = sections.find((item) => item.slug === slug);
  const page = section?.links.find((item) => item.slug === childSlug);

  if (!section || !page) {
    notFound();
  }

  const feature = PAGE_FEATURES[`${section.slug}/${page.slug}`];

  return (
    <SiteShell>
      <section className="subhero">
        <img src={feature?.heroImage ?? section.image} alt={page.title} />
        <div>
          <Link href={`/section/${section.slug}`}>{section.title}</Link>
          <h1>{page.title}</h1>
          {feature?.hideHeroDescription ? null : <p>{page.body}</p>}
        </div>
      </section>

      {feature ? (
        <section className="section-wrap page-feature">
          {feature.image ? <img src={feature.image} alt={feature.alt ?? feature.title} /> : null}
          <div>
            <p className="eyebrow">Պեմզաշենի միջնակարգ դպրոց</p>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
            {feature.href ? (
              <a className="feature-link" href={feature.href} target="_blank" rel="noreferrer">
                {feature.linkLabel}
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      <UserMaterials sectionSlug={section.slug} pageSlug={page.slug} />
    </SiteShell>
  );
}
