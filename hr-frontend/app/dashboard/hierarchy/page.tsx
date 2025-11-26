"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// 1. ÇALIŞAN TİPİ (Position alanı zorunlu eklendi)
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  managerId: number | null;
  position: string | null; 
}

export default function HierarchyPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  
  // 2. STATE TANIMLARI (İsimler burada sabitlendi)
  const [showModal, setShowModal] = useState(false);
  
  // Hata veren kısım burasıydı, şimdi tanımlı:
  const [selectedSubordinate, setSelectedSubordinate] = useState<Employee | null>(null); 
  
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  
  // Yeni özellik için state'ler
  const [isPositionRequired, setIsPositionRequired] = useState(false);
  const [managerPositionInput, setManagerPositionInput] = useState('');

  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    
    if (!t || (r !== "ADMIN" && r !== "MANAGER")) {
      alert("Bu sayfaya erişim yetkiniz yok!");
      router.push("/dashboard");
      return;
    }
    setToken(t);
    fetchEmployees(t);
  }, [router]);

  const fetchEmployees = async (t: string) => {
    try {
      const response = await axios.get("http://localhost:8080/api/employees", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Yönetici Seçimi ve Pozisyon Kontrolü
  const handleManagerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const managerId = Number(e.target.value);
    setSelectedManagerId(managerId);

    if (managerId) {
      const manager = employees.find(e => e.id === managerId);
      // KURAL: Yönetici seçildi ama pozisyonu yoksa, zorunlu alan aç
      if (manager && (!manager.position || manager.position.trim() === '')) {
        setIsPositionRequired(true);
        setManagerPositionInput(''); 
      } else {
        setIsPositionRequired(false);
        setManagerPositionInput(manager?.position || '');
      }
    } else {
        setIsPositionRequired(false);
    }
  };

  // Kaydetme İşlemi
  const handleAssignHierarchy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // selectedSubordinate burada kullanılıyor, yukarıda tanımladık.
    if (!selectedSubordinate || !selectedManagerId) return;

    if (isPositionRequired && managerPositionInput.trim() === '') {
        alert('İş kuralı: Yöneticinin pozisyon bilgisi zorunludur!');
        return;
    }

    if (selectedSubordinate.id === selectedManagerId) {
        alert("Kişi kendi kendisinin yöneticisi olamaz!");
        return;
    }

    try {
        const payload = {
            subordinateId: selectedSubordinate.id,
            managerId: selectedManagerId,
            managerPosition: managerPositionInput.trim() || null,
        };
        
        await axios.post("http://localhost:8080/api/employees/assign-hierarchy", payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        alert(`Atama başarılı!`);
        setShowModal(false);
        fetchEmployees(token);

    } catch (error) {
        console.error("Hata:", error);
        alert("İşlem başarısız.");
    }
  };

  const getManagerName = (managerId: number | null) => {
    if (!managerId) return <span className="text-gray-400 italic">Yöneticisi Yok</span>;
    const manager = employees.find(e => e.id === managerId);
    return manager ? <span className="font-semibold text-gray-800">{manager.firstName} {manager.lastName}</span> : "Bilinmiyor";
  };

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hiyerarşi Yönetimi</h1>
        <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-gray-900">← Geri</button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="px-5 py-3">Çalışan</th>
              <th className="px-5 py-3">Pozisyon / Unvan</th>
              <th className="px-5 py-3">Yöneticisi</th>
              <th className="px-5 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                <td className="px-5 py-4 text-sm text-gray-600">
                    {emp.position ? <span className="text-blue-600 font-bold">{emp.position}</span> : emp.jobTitle}
                </td>
                <td className="px-5 py-4 text-sm">{getManagerName(emp.managerId)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedSubordinate(emp); // State güncelleniyor
                      setSelectedManagerId(emp.managerId);
                      setIsPositionRequired(false);
                      setManagerPositionInput(emp.position || '');
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

      {/* MODAL */}
      {showModal && selectedSubordinate && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Yönetici Seçimi</h3>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-bold text-blue-600">{selectedSubordinate.firstName} {selectedSubordinate.lastName}</span> kime bağlı çalışacak?
            </p>

            <form onSubmit={handleAssignHierarchy}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Yönetici</label>
                <select
                  className="w-full border p-2 rounded text-gray-700 bg-white"
                  value={selectedManagerId || ''}
                  onChange={handleManagerSelectChange}
                  required
                >
                  <option value="" disabled>-- Seçiniz --</option>
                  {employees
                    .filter(mgr => mgr.id !== selectedSubordinate.id)
                    .map(mgr => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.firstName} {mgr.lastName} {mgr.position ? `(${mgr.position})` : '(Pozisyon Yok)'}
                      </option>
                  ))}
                </select>
              </div>

              {/* KOŞULLU POZİSYON GİRİŞİ */}
              {isPositionRequired && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <label className="block text-xs font-bold text-red-600 mb-1">
                        ⚠️ YÖNETİCİ POZİSYONU (Zorunlu)
                    </label>
                    <input
                        type="text"
                        placeholder="Örn: Takım Lideri"
                        value={managerPositionInput}
                        onChange={(e) => setManagerPositionInput(e.target.value)}
                        className="w-full border-red-400 border p-2 rounded text-sm text-black"
                        required 
                    />
                    <p className="text-xs text-red-500 mt-1">Bu kişi yönetici olacağı için pozisyonu girilmelidir.</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">İptal</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}