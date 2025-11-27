import { getRequestConfig } from "next-intl/server";

// Desteklenen diller
const locales = ["tr", "en"];

export default getRequestConfig(async ({ requestLocale }) => {
  // Gelen locale bilgisini al (bazı sürümlerde 'locale' bazılarında 'requestLocale' olarak gelir)
  // next-intl'in son sürümünde 'requestLocale' promise dönebilir, onu beklemeliyiz.
  let locale = await requestLocale;

  // Eğer locale yoksa veya desteklenmiyorsa varsayılanı kullan veya 404 ver
  if (!locale || !locales.includes(locale as any)) {
    locale = "tr"; // veya notFound();
  }

  return {
    // --- DÜZELTME BURADA: 'locale' alanını ekledik ---
    locale,
    // -------------------------------------------------
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
