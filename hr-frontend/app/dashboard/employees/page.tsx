"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { employeeService } from "../../../services/employeeService";
import { Employee } from "../../../types";



export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [role, setRole] = useState("USER");

  // Modal ve Form State'leri
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "IT", // Varsayılan
    jobTitle: "",
    position: "",
    phoneNumber: "",
    hireDate: new Date().toISOString().split('T')[0] // Bugünün tarihi
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");

    // Sadece Admin ve Manager girebilsin
    if (!t || (r !== "ADMIN" && r !== "MANAGER")) {
      alert("Yetkisiz erişim!");
      router.push("/dashboard");
      return;
    }

    setToken(t);
    setRole(r || "");
    loadEmployees()
  }, [router]);

  const loadEmployees = async () => {
    try {
      // Token parametresine gerek yok, servis hallediyor
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.create(formData);

      alert("Personel başarıyla eklendi!");
      setShowModal(false);
      // Formu temizle
      setFormData({
        firstName: "", lastName: "", email: "", department: "IT", jobTitle: "", position: "", phoneNumber: "", hireDate: ""
      });
      // Listeyi yenile
      loadEmployees()
    } catch (error) {
      console.error(error);
      alert("Ekleme işlemi başarısız!");
    }
  };

  // Form elemanlarını yöneten genel fonksiyon
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personel Yönetimi</h1>
        <div className="space-x-4">
          <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-gray-900">← Geri</button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          >
            + Yeni Çalışan Ekle
          </button>
        </div>
      </div>

      {/* Çalışan Listesi */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="px-5 py-3">Ad Soyad</th>
              <th className="px-5 py-3">Departman</th>
              <th className="px-5 py-3">Unvan</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Giriş Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{emp.department}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{emp.jobTitle}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{emp.email}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{emp.hireDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && !loading && <div className="p-4 text-center text-gray-500">Kayıtlı çalışan yok.</div>}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-[500px]">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Yeni Çalışan Kartı</h2>

            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">

              {/* Ad */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Ad</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Soyad */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Soyad</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Email */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Email (Benzersiz)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Departman */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Departman</label>
                <select name="department" value={formData.department} onChange={handleChange} className="w-full border p-2 rounded text-sm text-black">
                  <option value="IT">IT / Yazılım</option>
                  <option value="HR">İnsan Kaynakları</option>
                  <option value="SALES">Satış & Pazarlama</option>
                  <option value="FINANCE">Finans</option>
                </select>
              </div>

              {/* Unvan */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Unvan</label>
                <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Örn: Senior Developer" className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* YENİ: Pozisyon */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Pozisyon / Rol</label>
                <input
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Örn: Takım Lideri"
                  className="w-full border p-2 rounded text-sm text-black"
                />
              </div>

              {/* Telefon */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Telefon</label>
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Giriş Tarihi */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">İşe Giriş Tarihi</label>
                <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Butonlar */}
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">İptal</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Kaydet</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}