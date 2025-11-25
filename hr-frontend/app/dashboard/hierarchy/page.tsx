"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  managerId: number | null;
}

export default function HierarchyPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("USER");

  // Modal ve Seçim İşlemleri için State'ler
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    
    // Güvenlik Kontrolü: Sadece Yönetici ve HR girebilsin
    if (!token || (userRole !== "ADMIN" && userRole !== "MANAGER")) {
      alert("Bu sayfaya erişim yetkiniz yok!");
      router.push("/dashboard");
      return;
    }

    setRole(userRole);
    fetchEmployees(token);
  }, [router]);

  const fetchEmployees = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:8080/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
      alert("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  // Yönetici Ata Fonksiyonu
  const handleAssignManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedManagerId) return;

    const token = localStorage.getItem("token");
    
    // Kendini yönetici seçerse uyarı ver
    if (selectedEmployee.id === Number(selectedManagerId)) {
        alert("Bir kişi kendi kendisinin yöneticisi olamaz!");
        return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/employees/${selectedEmployee.id}/assign-manager/${selectedManagerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert("Yönetici başarıyla atandı!");
      setShowModal(false);
      fetchEmployees(token!); // Listeyi güncelle
    } catch (error) {
      console.error(error);
      alert("Atama işlemi başarısız!");
    }
  };

  // Yardımcı Fonksiyon: ID'den İsim Bulma
  // Listede sadece "Manager ID: 5" yazmasın diye, 5 numaranın kim olduğunu bulur.
  const getManagerName = (managerId: number | null) => {
    if (!managerId) return <span className="text-gray-400 italic">Yöneticisi Yok (CEO/Root)</span>;
    const manager = employees.find(e => e.id === managerId);
    return manager ? <span className="font-semibold text-gray-800">{manager.firstName} {manager.lastName}</span> : "Bilinmiyor";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hiyerarşi & Yönetici Atama</h1>
        <button onClick={() => router.push("/dashboard")} className="text-gray-600">← Geri</button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="px-5 py-3">Çalışan</th>
              <th className="px-5 py-3">Departman / Unvan</th>
              <th className="px-5 py-3">Mevcut Yöneticisi</th>
              <th className="px-5 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">
                  {emp.firstName} {emp.lastName}
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {emp.department} <br/> <span className="text-xs text-gray-400">{emp.jobTitle}</span>
                </td>
                <td className="px-5 py-4 text-sm">
                  {getManagerName(emp.managerId)}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setSelectedManagerId(emp.managerId?.toString() || ""); // Varsa mevcut yönetici seçili gelsin
                      setShowModal(true);
                    }}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 shadow"
                  >
                    Atama Yap
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL (Yönetici Seçimi) --- */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Yönetici Seçimi</h3>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-bold text-blue-600">{selectedEmployee.firstName} {selectedEmployee.lastName}</span> adlı personel kime raporlayacak?
            </p>

            <form onSubmit={handleAssignManager}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Yeni Yönetici</label>
                <select
                  className="w-full border p-2 rounded text-gray-700 bg-white focus:outline-none focus:border-indigo-500"
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  size={5} // Listeyi açık göster ki araması kolay olsun
                  required
                >
                  <option value="" disabled>-- Bir Yönetici Seçin --</option>
                  {employees
                    .filter(mgr => mgr.id !== selectedEmployee.id) // Kendisini listede gösterme
                    .map(mgr => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.firstName} {mgr.lastName} ({mgr.jobTitle})
                      </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}