"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); // Hangi sayfadayız? (Aktif linki boyamak için)
  
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Sadece tarayıcı tarafında çalışır
    const role = localStorage.getItem("role");
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    setUserRole(role || "");
    setUsername(user || "");
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Link stili için yardımcı fonksiyon
  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-2 rounded transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
      isActive 
        ? "bg-blue-100 text-blue-700 shadow-sm" 
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- SABİT HEADER (ÜST MENÜ) --- */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => router.push("/dashboard")}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2">
                HR
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-tight">Platform</span>
            </div>

            {/* Sağ Taraf: Kullanıcı ve Çıkış */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">{username}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100 transition"
                title="Çıkış Yap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          </div>

          {/* --- NAVİGASYON LİNKLERİ (ALT SATIR) --- */}
          <nav className="flex space-x-1 overflow-x-auto pb-3 scrollbar-hide">
            {/* Herkesin Görebileceği Linkler */}
            <Link href="/dashboard" className={getLinkClass("/dashboard")}>
               🏠 Ana Sayfa
            </Link>
            <Link href="/dashboard/leaves" className={getLinkClass("/dashboard/leaves")}>
               📅 İzinler
            </Link>
            <Link href="/dashboard/documents" className={getLinkClass("/dashboard/documents")}>
               📄 Belgeler
            </Link>
            <Link href="/dashboard/organization" className={getLinkClass("/dashboard/organization")}>
               🌳 Org. Şeması
            </Link>

            {/* SADECE ADMIN LİNKLERİ */}
            {userRole === "ADMIN" && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div> {/* Ayırıcı */}
                
                <Link href="/dashboard/employees" className={getLinkClass("/dashboard/employees")}>
                   👥 Personel
                </Link>
                <Link href="/dashboard/hierarchy" className={getLinkClass("/dashboard/hierarchy")}>
                   ⚙️ Hiyerarşi
                </Link>
                <Link href="/dashboard/departments" className={getLinkClass("/dashboard/departments")}>
                   🏢 Departman
                </Link>
                <Link href="/dashboard/job-titles" className={getLinkClass("/dashboard/job-titles")}>
                   🏷️ Unvan
                </Link>
                <Link href="/dashboard/positions" className={getLinkClass("/dashboard/positions")}>
                   👑 Pozisyon
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* --- DEĞİŞEN İÇERİK (SAYFALAR BURAYA GELİR) --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}