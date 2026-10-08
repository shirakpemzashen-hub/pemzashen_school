export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pemzashen-school.vercel.app"
).replace(/\/$/, "");

const addresses = {
  hy: "ՀՀ Շիրակի մարզ, Արթիկ համայնք, Պեմզաշեն",
  ru: "Республика Армения, Ширакская область, Пемзашен",
  en: "Pemzashen, Shirak Region, Republic of Armenia",
} as const;

export function schoolStructuredData(
  locale: keyof typeof addresses,
  name: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "School",
    name,
    url: `${siteUrl}/${locale}`,
    image: `${siteUrl}/pemzashen-school.jpg`,
    email: "shirak.pemzashen@gmail.com",
    telephone: ["+37493182898", "+37493472123"],
    address: {
      "@type": "PostalAddress",
      addressLocality: addresses[locale],
      addressRegion: "Shirak",
      addressCountry: "AM",
    },
  };
}
