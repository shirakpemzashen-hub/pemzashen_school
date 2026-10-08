import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { schoolStructuredData, siteUrl } from "../seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: title.split(" | ")[0],
      title,
      description,
      locale: locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US",
      images: [{ url: "/pemzashen-school.jpg", alt: title.split(" | ")[0] }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/pemzashen-school.jpg"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "hy" | "ru" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const seoTranslations = await getTranslations({ locale, namespace: "layout" });
  const structuredData = schoolStructuredData(
    locale as "hy" | "ru" | "en",
    seoTranslations("title").split(" | ")[0],
  );

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
