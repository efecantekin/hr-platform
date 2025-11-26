"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeService } from "../../../services/employeeService";
import { positionService, Position } from "../../../services/positionService";
import { Employee } from "../../../types";

export default function HierarchyPage() {
  const router = useRouter();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]); // Dropdown için
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubordinate, setSelectedSubordinate] = useState<Employee | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [isPositionRequired, setIsPositionRequired] = useState(false);
  const [managerPositionInput, setManagerPositionInput] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || (role !== "ADMIN" && role !== "MANAGER")) {
      alert("Bu sayfaya erişim yetkiniz yok!");
      router.push("/dashboard");
      return;
    }
    
    Promise.all([fetchEmployees(), fetchPositions()]);
  }, [router]);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data as Employee[]);
    } catch (error) {
      console.error("Personel listesi hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const data = await positionService.getAll();
      setPositions(data);
    } catch (error) {
      console.error("Pozisyon listesi hatası:", error);
    }
  };

  const handleManagerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const managerId = Number(e.target.value);
    setSelectedManagerId(managerId);

    if (managerId) {
      const manager = employees.find(e => e.id === managerId);
      
      // KURAL: Seçilen yöneticinin pozisyonu yoksa, zorunlu alan aç
      if (manager && (!manager.position || manager.position.trim() === '')) {
        setIsPositionRequired(true);
        setManagerPositionInput(''); // Seçimi sıfırla
      } else {
        setIsPositionRequired(false);
        setManagerPositionInput(manager?.position || '');
      }
    } else {
        setIsPositionRequired(false);
    }
  };

  const handleAssignHierarchy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubordinate || !selectedManagerId) return;

    if (isPositionRequired && managerPositionInput.trim() === '') {
        alert('İş kuralı: Yöneticinin pozisyon bilgisi seçilmelidir!');
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
            // Eğer zorunluysa yeni seçilen pozisyonu, değilse null gönder
            managerPosition: isPositionRequired ? managerPositionInput : null,
        };

        await employeeService.assignHierarchy(payload);

        alert(`Atama başarılı!`);
        setShowModal(false);
        fetchEmployees(); // Listeyi yenile

    } catch (error) {
        console.error("Atama Hatası:", error);
        alert("İşlem başarısız.");
    }
  };

  // Tabloda yönetici ismini göstermek için yardımcı
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
              <th className="px-5 py-3">Mevcut Yöneticisi</th>
              <th className="px-5 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                <td className="px-5 py-4 text-sm text-gray-600">
                    {emp.position ? <span className="text-indigo-600 font-bold">{emp.position}</span> : emp.jobTitle}
                </td>
                <td className="px-5 py-4 text-sm">{getManagerName(emp.managerId ?? null)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedSubordinate(emp);
                      setSelectedManagerId(emp.managerId ?? null);
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

      {/* --- MODAL (YÖNETİCİ SEÇİMİ) --- */}
      {showModal && selectedSubordinate && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Yönetici Seçimi</h3>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-bold text-blue-600">{selectedSubordinate.firstName} {selectedSubordinate.lastName}</span> kime raporlayacak?
            </p>

            <form onSubmit={handleAssignHierarchy}>
              {/* 1. YÖNETİCİ DROPDOWN */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Yeni Yönetici Seçin</label>
                <select
                  className="w-full border p-2 rounded text-gray-700 bg-white focus:outline-none focus:border-indigo-500"
                  value={selectedManagerId || ''}
                  onChange={handleManagerSelectChange}
                  required
                >
                  <option value="" disabled>-- Bir Yönetici Seçin --</option>
                  {employees
                    .filter(mgr => mgr.id !== selectedSubordinate.id)
                    .map(mgr => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.firstName} {mgr.lastName} {mgr.position ? `(${mgr.position})` : '(Pozisyon Yok)'}
                      </option>
                  ))}
                </select>
              </div>

              {/* 2. KOŞULLU POZİSYON DROPDOWN (Sadece yönetici pozisyonu yoksa açılır) */}
              {isPositionRequired && (
                <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
                    <label className="block text-sm font-bold text-red-700 mb-1">
                        ⚠️ Yöneticinin Pozisyonu Eksik!
                    </label>
                    <p className="text-xs text-gray-600 mb-2">Lütfen bu yöneticiye bir pozisyon atayın:</p>
                    
                    <select
                        value={managerPositionInput}
                        onChange={(e) => setManagerPositionInput(e.target.value)}
                        className="w-full border-red-400 border-2 p-2 rounded-lg text-sm text-black bg-white focus:outline-none"
                        required
                    >
                        <option value="" disabled>-- Pozisyon Seçin --</option>
                        {positions.map((pos) => (
                            <option key={pos.id} value={pos.title}>
                                {pos.title}
                            </option>
                        ))}
                    </select>
                    
                    <div className="mt-2 text-right">
                        <a href="/dashboard/positions" target="_blank" className="text-xs text-blue-600 underline hover:text-blue-800">
                            + Yeni Pozisyon Tanımla
                        </a>
                    </div>
                </div>
              )}

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
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow"
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