"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/ui/Sidebar"; // Sidebar'ı import et
import NotificationDropdown from "../../../components/ui/NotificationDropdown";
import Image from "next/image"; // Image bileşeni eklendi

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* --- SOL SIDEBAR (MENÜ) --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        {/* LOGO ALANI (GÜNCELLENDİ) */}
        <div
          className="h-16 flex items-center px-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition"
          onClick={() => router.push("/dashboard")}
        >
          {/* Logo Görseli */}
          <div className="relative w-40 h-40 mr-3">
            <Image
              src="/peepl-small.png" // public/logo.png dosyasını okur
              alt="HR Platform Logo"
              fill
              className="object-contain" // Görsel oranını korur
            />
          </div>

          {/* <span className="text-xl font-bold text-gray-800 tracking-tight">
            HR <span className="text-blue-600">Platform</span>
          </span> */}
        </div>

        {/* Dinamik Menü Bileşeni */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <Sidebar />
        </div>

        {/* Alt Bilgi (Opsiyonel) */}
        <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          v1.0.0 Enterprise
        </div>
      </aside>

      {/* --- SAĞ TARAF (İÇERİK) --- */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Üst Header (Sadece Profil ve Çıkış) */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-end px-8 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">{username}</p>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium border border-blue-100">
                {userRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100 transition border border-red-100"
              title="Çıkış Yap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Sayfa İçeriği */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
