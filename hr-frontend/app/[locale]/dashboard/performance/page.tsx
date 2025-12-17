"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../../../components/ui/Card";

export default function PerformanceDashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("USER");

  useEffect(() => {
    // Rol kontrolü (Client-side)
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  const navigateTo = (path: string) => {
    router.push(`/dashboard/performance/${path}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Performans Yönetimi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* HERKESİN GÖREBİLECEĞİ ALAN */}
        <div onClick={() => navigateTo("my-reviews")} className="cursor-pointer group">
          <Card className="p-6 h-full border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Değerlendirmelerim</h3>
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-sm text-gray-600">
              Size atanan performans değerlendirmelerini görüntüleyin ve doldurun.
            </p>
            <div className="mt-4 text-blue-600 text-sm font-medium group-hover:underline">
              Görüntüle &rarr;
            </div>
          </Card>
        </div>

        {/* SADECE YÖNETİCİ VE İK (ADMIN/MANAGER) ALANLARI */}
        {(role === "ADMIN" || role === "MANAGER") && (
          <>
            <div onClick={() => navigateTo("templates")} className="cursor-pointer group">
              <Card className="p-6 h-full border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Anket Şablonları</h3>
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-sm text-gray-600">
                  Yeni performans anketi şablonları oluşturun ve düzenleyin.
                </p>
                <div className="mt-4 text-purple-600 text-sm font-medium group-hover:underline">
                  Yönet &rarr;
                </div>
              </Card>
            </div>

            <div onClick={() => navigateTo("assignments")} className="cursor-pointer group">
              <Card className="p-6 h-full border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Değerlendirme Atama</h3>
                  <span className="text-2xl">👉</span>
                </div>
                <p className="text-sm text-gray-600">
                  Çalışanlara ve yöneticilere performans değerlendirmesi atayın.
                </p>
                <div className="mt-4 text-orange-600 text-sm font-medium group-hover:underline">
                  Atama Yap &rarr;
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
