import { getTranslations } from "next-intl/server";
import { Link } from "../../../../i18n/navigation";
import { SiteShell } from "../../../components";

const SCHOOL_EMAIL = "shirak.pemzashen@gmail.com";
const SCHOOL_PHONES = ["093-18-28-98", "093-47-21-23"];
const SCHOOL_ADDRESS = "ՀՀ Շիրակի մարզ, Արթիկ համայնք, բնակավայր Պեմզաշեն, 1-ին փողոց, շենք 2";
const MAP_ARIA_LABEL = "Պեմզաշեն — OpenStreetMap";
const STUDENT_COUNCIL_FACEBOOK_URL = "https://www.facebook.com/share/18UrwtpFjS/";
const KINDERGARTEN_FACEBOOK_URL = "https://www.facebook.com/share/1JmSuAyKKe/";

const MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=43.918029%2C40.566868%2C43.958029%2C40.606868&layer=mapnik&marker=40.586868%2C43.938029";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <SiteShell>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="subhero">
        <img
          src="/pemzashen-school.jpg"
          alt={t("title")}
        />
        <div>
          <Link href="/">{t("homeLink")}</Link>
          <h1>{t("title")}</h1>
          <p>{t("description")}</p>
        </div>
      </section>

      <div className="section-wrap">
        {/* ── Contact info cards ───────────────────────────────── */}
        <section aria-labelledby="contact-info-heading">
          <div className="section-heading">
            <p className="eyebrow">{t("infoEyebrow")}</p>
            <h2 id="contact-info-heading">{t("infoTitle")}</h2>
          </div>

          <div className="contact-info-grid">
            <div className="contact-info-card">
              <p className="eyebrow">{t("addressLabel")}</p>
              <strong>{SCHOOL_ADDRESS}</strong>
            </div>

            <div className="contact-info-card">
              <p className="eyebrow">{t("phoneLabel")}</p>
              <strong className="contact-stack">
                {SCHOOL_PHONES.map((phone) => (
                  <a key={phone} href={`tel:${phone.replaceAll("-", "")}`}>{phone}</a>
                ))}
              </strong>
            </div>

            <div className="contact-info-card">
              <p className="eyebrow">{t("emailLabel")}</p>
              <strong><a href={`mailto:${SCHOOL_EMAIL}`}>{SCHOOL_EMAIL}</a></strong>
            </div>
          </div>
        </section>

        {/* ── Map ─────────────────────────────────────────────── */}
        <section className="contact-map-wrap" id="map">
            <div className="section-heading">
              <p className="eyebrow">{t("mapEyebrow")}</p>
              <h2>{t("mapTitle")}</h2>
            </div>
            <p>{SCHOOL_ADDRESS}</p>

            <div className="contact-map-frame">
              <iframe
                src={MAP_EMBED}
                title={MAP_ARIA_LABEL}
                aria-label={MAP_ARIA_LABEL}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
        </section>

        {/* ── Social links ─────────────────────────────────────── */}
        <section className="contact-social" aria-labelledby="social-heading">
          <div className="section-heading">
            <p className="eyebrow">{t("socialEyebrow")}</p>
            <h2 id="social-heading">{t("socialTitle")}</h2>
          </div>
          <p style={{ color: "var(--muted)", margin: "0 0 4px" }}>
            {t("socialDescription")}
          </p>

          <div className="contact-social-links">
            <a
              href={STUDENT_COUNCIL_FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="contact-social-link"
              aria-label="Աշակերտական խորհրդի Facebook էջ"
            >
              {/* Facebook icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54v-2.2c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.88h-2.33v6.99A10 10 0 0 0 22 12z" />
              </svg>
              Աշակերտական խորհուրդ
            </a>

            <a
              href={KINDERGARTEN_FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="contact-social-link"
              aria-label="Պեմզաշենի մ/դ Facebook էջ"
            >
              {/* Facebook icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54v-2.2c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.88h-2.33v6.99A10 10 0 0 0 22 12z" />
              </svg>
              Պեմզաշենի մ/դ
            </a>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
