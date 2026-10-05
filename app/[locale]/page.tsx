import { getTranslations } from "next-intl/server";
import { Link } from "../../i18n/navigation";
import { SiteShell } from "../components";
import { sections, news } from "../data";

const FEATURED_SLUGS = ["about", "councils", "learning", "events"];

export default async function Home() {
  const t = await getTranslations();
  const featured = sections.filter((s) => FEATURED_SLUGS.includes(s.slug));

  return (
    <SiteShell>
      <section className="hero">
        <img
          src="/pemzashen-school.jpg"
          alt={t("home.heroImgAlt")}
        />
        <div className="hero-content">
          <p className="eyebrow">{t("home.eyebrow")}</p>
          <h1>{t("home.heroTitle")}</h1>
          <p>{t("home.heroDescription")}</p>
          <div className="hero-actions">
            <Link href="/section/about">{t("home.btnAbout")}</Link>
            <Link href="/section/events">{t("home.btnEvents")}</Link>
          </div>
        </div>
      </section>

      <section className="quick-panel">
        {news.map((item) => (
          <article key={item.title} className="notice-card">
            <span>{item.category}</span>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <small>{item.date}</small>
          </article>
        ))}
      </section>

      <section className="section-wrap">
        <div className="section-heading">
          <p className="eyebrow">{t("home.structureEyebrow")}</p>
          <h2>{t("home.structureTitle")}</h2>
        </div>
        <div className="card-grid">
          {featured.map((section) => (
            <Link
              href={`/section/${section.slug}`}
              className="feature-card"
              key={section.slug}
            >
              <img src={section.image} alt={section.title} />
              <div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-wrap split">
        <div>
          <p className="eyebrow">{t("home.platformEyebrow")}</p>
          <h2>{t("home.platformTitle")}</h2>
          <p>{t("home.platformDescription")}</p>
        </div>
      </section>
    </SiteShell>
  );
}
