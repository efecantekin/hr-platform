import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // Desteklenen diller
  locales: ["tr", "en"],

  // Varsayılan dil (URL'de dil yoksa buna gider)
  defaultLocale: "tr",
});

export const config = {
  // Sadece api, _next, static dosyalar HARİÇ her şeyi yakala
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
