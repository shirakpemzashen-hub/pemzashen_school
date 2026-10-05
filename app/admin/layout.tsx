import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "../../i18n/routing";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages({ locale: routing.defaultLocale });

  return (
    <html lang={routing.defaultLocale}>
      <body>
        <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
