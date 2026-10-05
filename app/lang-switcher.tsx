"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "../i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: string) {
    router.replace(pathname, { locale: next as "hy" | "ru" | "en" });
  }

  return (
    <div className="lang-switcher" role="navigation" aria-label="Language">
      <button
        onClick={() => switchTo("hy")}
        className={locale === "hy" ? "active" : ""}
        aria-current={locale === "hy" ? "true" : undefined}
      >
        ՀՅ
      </button>
      <button
        onClick={() => switchTo("ru")}
        className={locale === "ru" ? "active" : ""}
        aria-current={locale === "ru" ? "true" : undefined}
      >
        РУ
      </button>
      <button
        onClick={() => switchTo("en")}
        className={locale === "en" ? "active" : ""}
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </button>
    </div>
  );
}
