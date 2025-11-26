"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// 1. AXIOS YERİNE SERVİSİ İMPORT EDİYORUZ
import { employeeService } from "../../../services/employeeService";
// Tipleri de merkezi dosyadan alabilirsin (eğer oraya eklediysen)
// import { Employee } from "../../../types";

// (Eğer types klasöründen import etmiyorsan bu interface burada kalabilir)
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
  
  // State tanımları
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
    
    // Token parametresine gerek kalmadı
    fetchEmployees();
  }, [router]);

  // 2. SERVİS İLE VERİ ÇEKME (Parametresiz)
  const fetchEmployees = async () => {
    try {
      // axios.get yerine servis kullanıyoruz
      const data = await employeeService.getAll(); 
      setEmployees(data as Employee[]); // Tip uyumu için casting gerekebilir
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const managerId = Number(e.target.value);
    setSelectedManagerId(managerId);

    if (managerId) {
      const manager = employees.find(e => e.id === managerId);
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

  // 3. SERVİS İLE ATAMA YAPMA
  const handleAssignHierarchy = async (e: React.FormEvent) => {
    e.preventDefault();
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
        
        // axios.post yerine servis kullanıyoruz
        await employeeService.assignHierarchy(payload);
        
        alert(`Atama başarılı!`);
        setShowModal(false);
        fetchEmployees(); // Listeyi yenile

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
        <h1 className="text-2xl font-bold text-gray-800">Hiyerarşi Yönetimi (Servis Entegreli)</h1>
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
                      setSelectedSubordinate(emp);
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

      {/* MODAL KISMI AYNI (Kod tekrarı olmaması için burayı kısaltıyorum, senin kodundaki gibi kalacak) */}
      {showModal && selectedSubordinate && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
             {/* ... FORM İÇERİĞİ AYNI ... */}
             <form onSubmit={handleAssignHierarchy}>
                {/* ... INPUTLAR AYNI ... */}
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