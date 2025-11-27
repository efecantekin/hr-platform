"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("user") || "Kullanıcı");
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-8 text-center">
      <div className="mb-6">
        <span className="text-6xl">👋</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Hoş Geldin, <span className="text-blue-600">{username}</span>!
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto text-lg">
        İnsan Kaynakları Yönetim Platformuna başarıyla giriş yaptın. Yukarıdaki menüyü kullanarak
        işlemlerini gerçekleştirebilirsin.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
        <div className="p-6 border rounded-lg hover:shadow-md transition bg-blue-50 border-blue-100">
          <h3 className="font-bold text-blue-800 mb-2">📅 İzin Durumu</h3>
          <p className="text-sm text-blue-600">
            Yıllık izin bakiyeni görüntüle ve yeni izin talebi oluştur.
          </p>
        </div>
        <div className="p-6 border rounded-lg hover:shadow-md transition bg-purple-50 border-purple-100">
          <h3 className="font-bold text-purple-800 mb-2">📄 Belge İşlemleri</h3>
          <p className="text-sm text-purple-600">
            Çalışma belgesi, bordro gibi resmi evraklarını talep et.
          </p>
        </div>
        <div className="p-6 border rounded-lg hover:shadow-md transition bg-green-50 border-green-100">
          <h3 className="font-bold text-green-800 mb-2">🌳 Organizasyon</h3>
          <p className="text-sm text-green-600">
            Şirket hiyerarşisini ve ekip arkadaşlarını incele.
          </p>
        </div>
      </div>
    </div>
  );
}
