"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Link bileşeni import edilmeli

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // EKSİK OLAN KISIM BURASIYDI: Rolü tutacak değişken
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // Rolü hafızadan oku

    if (!token) {
      router.push("/");
      return;
    }

    // Rolü state'e kaydet
    if (role) setUserRole(role);

    fetchEmployees(token);
  }, [router]);

  const fetchEmployees = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:8080/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(response.data);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      setError("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role"); // Çıkışta rolü de sil
    localStorage.removeItem("employeeId");
    router.push("/");
  };

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">HR Platform</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hoşgeldin, {typeof window !== 'undefined' ? localStorage.getItem("user") : ""}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
          >
            Çıkış Yap
          </button>
        </div>
      </nav>

      <main className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Personel Listesi</h2>

        {/* Butonlar Grubu */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/dashboard/leaves"
            className="bg-green-600 text-white px-4 py-3 rounded shadow hover:bg-green-700 flex items-center gap-2"
          >
            📅 İzin Yönetimi
          </Link>

          <Link
            href="/dashboard/documents"
            className="bg-purple-600 text-white px-4 py-3 rounded shadow hover:bg-purple-700 flex items-center gap-2"
          >
            📄 Belge Talepleri
          </Link>

          <Link
            href="/dashboard/organization"
            className="bg-indigo-600 text-white px-4 py-3 rounded shadow hover:bg-indigo-700 flex items-center gap-2"
          >
            🌳 Org. Şeması
          </Link>

          {/* Sadece ADMIN görebilir */}
          {userRole === "ADMIN" && (
            <Link
              href="/dashboard/hierarchy"
              className="bg-gray-700 text-white px-4 py-3 rounded shadow hover:bg-gray-800 flex items-center gap-2"
            >
              ⚙️ Hiyerarşi Yönetimi
            </Link>
          )}

          {/* PERSONEL YÖNETİMİ (Sadece ADMIN görebilir) */}
          {userRole === "ADMIN" && (
            <Link
              href="/dashboard/employees"
              className="bg-blue-800 text-white px-4 py-3 rounded shadow hover:bg-blue-900 flex items-center gap-2"
            >
              👥 Personel Listesi
            </Link>
          )}
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Departman
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Unvan
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {emp.firstName} {emp.lastName}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                      <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                      <span className="relative">{emp.department}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{emp.jobTitle}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{emp.email}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <div className="p-4 text-center text-gray-500">Henüz çalışan kaydı yok.</div>
          )}
        </div>
      </main>
    </div>
  );
}