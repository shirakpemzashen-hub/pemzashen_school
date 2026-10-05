import "./globals.css";

// Root layout — minimal wrapper. Locale-specific layout lives at app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // children will be rendered by the [locale] layout which sets html/body
  return children as React.ReactElement;
}
