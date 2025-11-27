import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// CSS dosyanızın yeri src/app/globals.css ise bir üst klasöre çıkmamız gerekebilir
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HR Platform",
  description: "Kurumsal İnsan Kaynakları Yönetim Sistemi",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    // 2. HTML etiketine dinamik dili ver (SEO ve Tarayıcı için önemli)
    <html lang={locale}>
      <body className={inter.className}>
        {/* 3. Provider ile sarmala 
            Bu sayede alt componentlerdeki 'use client' dosyalarında 
            'useTranslations' hook'unu kullanabilirsin.
        */}
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
