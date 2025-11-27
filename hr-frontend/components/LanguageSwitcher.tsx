"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Şu anki dili URL'den anla (/tr/... ise tr, /en/... ise en)
  const currentLocale = pathname.startsWith("/en") ? "en" : "tr";

  const switchLanguage = (newLocale: string) => {
    // 1. Mevcut yoldan dil bilgisini çıkar (Örn: /tr/dashboard -> /dashboard)
    const pathWithoutLocale = pathname.replace(/^\/(tr|en)/, "");
    
    // 2. Yeni dili başa ekle ve yönlendir (Örn: /en + /dashboard)
    // Eğer path boşsa (root) sadece /en veya /tr olur
    const newPath = `/${newLocale}${pathWithoutLocale || ''}`;
    
    router.push(newPath);
  };

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
      <button
        onClick={() => switchLanguage("tr")}
        className={`px-3 py-1 text-xs font-bold rounded transition-all ${
          currentLocale === "tr"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        TR
      </button>
      <button
        onClick={() => switchLanguage("en")}
        className={`px-3 py-1 text-xs font-bold rounded transition-all ${
          currentLocale === "en"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}