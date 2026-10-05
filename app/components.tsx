import { getTranslations } from "next-intl/server";
import { SiteHeader } from "./site-header";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <footer className="footer">
        <div>
          <strong>{t("footer.schoolName")}</strong>
          <p>{t("footer.description")}</p>
        </div>
        <div className="footer-credits">
          <a href="tel:093182898">093-18-28-98</a>
          <a href="tel:093472123">093-47-21-23</a>
          <a href="mailto:shirak.pemzashen@gmail.com">shirak.pemzashen@gmail.com</a>
          <small>{t("footer.madeBy")}</small>
          <strong>{t("footer.madeByName")}</strong>
        </div>
      </footer>
    </>
  );
}
