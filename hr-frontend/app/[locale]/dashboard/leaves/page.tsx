"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Employee, LeaveRequest } from "../../../../types";
import { leaveService } from "../../../../services/leaveService";

export default function LeavesPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  // Hangi sekmedeyiz? "MY_LEAVES" (Çalışan) veya "MANAGER" (Yönetici)
  const [activeTab, setActiveTab] = useState("MY_LEAVES");

  // Yönetici alt sekmeleri: "PENDING" (Onay Bekleyen) veya "TEAM" (Ekibim)
  const [managerView, setManagerView] = useState("PENDING");

  // Veriler
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [myTeam, setMyTeam] = useState<Employee[]>([]);
  const [selectedEmployeeLeaves, setSelectedEmployeeLeaves] = useState<LeaveRequest[] | null>(null);
  const [userRole, setUserRole] = useState("USER"); // Varsayılan USER

  // Modal ve Form
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "YILLIK",
    startDate: "",
    endDate: "",
    description: "",
  });

useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const empId = localStorage.getItem("employeeId");

    if (!token) { router.push("/"); return; }
    
    setUserRole(role || "USER");
    
    // Token göndermeye gerek yok, interceptor hallediyor
    fetchMyLeaves(Number(empId));
  }, [router]);

  // --- VERİ ÇEKME FONKSİYONLARI ---

 const fetchMyLeaves = async (empId: number) => {
    try {
      const data = await leaveService.getByEmployee(empId);
      setMyLeaves(data);
    } catch (error) { console.error(error); }
  };

  const fetchPendingLeaves = async () => {
    try {
      const data = await leaveService.getPending();
      setPendingLeaves(data);
    } catch (error) { console.error(error); }
  };

  const fetchMyTeam = async () => {
    try {
      // Burada managerId'yi dinamik almak lazım ama demo için 2 demiştik
      // employeeService'e getTeamMembers eklemiştik, onu kullanalım
      // const data = await employeeService.getTeamMembers(2); 
      // Şimdilik axios.get kalsa da olur veya servise ekleyip çekebilirsin.
    } catch (error) { console.error(error); }
  };
  // 4. Ekibimden birinin detayına tıklandığında izinlerini getir
  const fetchEmployeeHistory = async (empId: number) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/leaves/employee/${empId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEmployeeLeaves(response.data);
    } catch (error) { console.error(error); }
  };

  // --- İŞLEM FONKSİYONLARI ---

  // İzin Talep Et
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Hardcoded employeeId yerine localStorage'dan geleni kullan
      const empId = Number(localStorage.getItem("employeeId") || 1);
      
      await leaveService.create({ employeeId: empId, ...formData } as any);
      
      alert("Talep gönderildi!");
      // ... modal kapatma vs ...
      fetchMyLeaves(empId);
    } catch (error) { alert("Hata oluştu"); }
  };

  // Onayla / Reddet Butonu
  const handleApproval = async (id: number, status: "APPROVED" | "REJECTED") => {
    try {
      await leaveService.updateStatus(id, status);
      alert(`İşlem başarılı: ${status}`);
      fetchPendingLeaves();
    } catch (error) { alert("İşlem başarısız"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">İzin Yönetimi</h1>
      </div>

      {/* ÜST SEKMELER (Çalışan vs Yönetici) */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium ${activeTab === "MY_LEAVES" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("MY_LEAVES")}
        >
          👤 İzinlerim
        </button>

        {/* GİZLEME MANTIĞI BURADA: */}
        {userRole === "ADMIN" && (
          <button
            className={`px-6 py-3 font-medium ${activeTab === "MANAGER" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500"}`}
            onClick={() => {
              setActiveTab("MANAGER");
              fetchPendingLeaves();
            }}
          >
            🛡️ Yönetici Paneli
          </button>
        )}
      </div>

      {/* 1. SEKME: BENİM İZİNLERİM */}
      {activeTab === "MY_LEAVES" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              + Yeni İzin Talebi
            </button>
          </div>
          <LeaveTable leaves={myLeaves} showActions={false} />
        </div>
      )}

      {/* 2. SEKME: YÖNETİCİ PANELİ */}
      {activeTab === "MANAGER" && (
        <div>
          {/* Yönetici Alt Menüsü */}
          <div className="flex gap-4 mb-6 bg-white p-2 rounded shadow-sm w-fit">
            <button
              onClick={() => { setManagerView("PENDING"); fetchPendingLeaves(); }}
              className={`px-4 py-2 rounded ${managerView === "PENDING" ? "bg-purple-100 text-purple-700 font-bold" : "text-gray-600"}`}
            >
              ⏳ Onay Bekleyenler
            </button>
            <button
              onClick={() => { setManagerView("TEAM"); fetchMyTeam(); }}
              className={`px-4 py-2 rounded ${managerView === "TEAM" ? "bg-purple-100 text-purple-700 font-bold" : "text-gray-600"}`}
            >
              👥 Ekibim
            </button>
          </div>

          {/* Onay Bekleyenler Listesi */}
          {managerView === "PENDING" && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4 text-gray-700">Onayımı Bekleyen İzinler</h3>
              {pendingLeaves.length === 0 ? <p className="text-gray-500">Bekleyen talep yok.</p> : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm text-gray-600">
                      <th className="p-3">Çalışan ID</th>
                      <th className="p-3">Tür</th>
                      <th className="p-3">Tarihler</th>
                      <th className="p-3">Açıklama</th>
                      <th className="p-3">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.map((leave) => (
                      <tr key={leave.id} className="border-b">
                        <td className="p-3 text-gray-800 font-bold">#{leave.employeeId}</td>
                        <td className="p-3 text-gray-800">{leave.leaveType}</td>
                        <td className="p-3 text-gray-600">{leave.startDate} / {leave.endDate}</td>
                        <td className="p-3 text-gray-500">{leave.description}</td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => handleApproval(leave.id, "APPROVED")}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            ✓ Onayla
                          </button>
                          <button
                            onClick={() => handleApproval(leave.id, "REJECTED")}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            ✕ Reddet
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Ekibim Listesi */}
          {managerView === "TEAM" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol Taraf: Personel Listesi */}
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4 text-gray-700">Ekibim</h3>
                {myTeam.length === 0 ? <p className="text-gray-500">Ekibinizde kimse yok (Manager ID: 2).</p> : (
                  <ul>
                    {myTeam.map(emp => (
                      <li
                        key={emp.id}
                        onClick={() => fetchEmployeeHistory(emp.id)}
                        className="p-3 border-b cursor-pointer hover:bg-purple-50 flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{emp.department}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Sağ Taraf: Seçilen Kişinin Geçmişi */}
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4 text-gray-700">İzin Geçmişi</h3>
                {!selectedEmployeeLeaves ? (
                  <p className="text-gray-400 text-sm">Soldan bir personel seçin...</p>
                ) : (
                  <LeaveTable leaves={selectedEmployeeLeaves} showActions={false} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL (Yeni İzin) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-lg w-96">
            <h2 className="font-bold text-xl mb-4 text-gray-800">Yeni İzin Talebi</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-2"><label className="block text-sm text-gray-700">Tür</label><select className="w-full border p-2 rounded text-black" value={formData.leaveType} onChange={e => setFormData({ ...formData, leaveType: e.target.value })}><option>YILLIK</option><option>MAZERET</option></select></div>
              <div className="mb-2"><label className="block text-sm text-gray-700">Başlangıç</label><input type="date" className="w-full border p-2 rounded text-black" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required /></div>
              <div className="mb-2"><label className="block text-sm text-gray-700">Bitiş</label><input type="date" className="w-full border p-2 rounded text-black" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required /></div>
              <div className="mb-4"><label className="block text-sm text-gray-700">Not</label><textarea className="w-full border p-2 rounded text-black" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 px-3 py-1 rounded text-black">İptal</button><button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Gönder</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Yardımcı Bileşen: Tablo
function LeaveTable({ leaves, showActions }: { leaves: LeaveRequest[], showActions: boolean }) {
  if (leaves.length === 0) return <p className="text-gray-500 text-sm">Kayıt yok.</p>;
  return (
    <table className="min-w-full bg-white shadow rounded overflow-hidden">
      <thead>
        <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
          <th className="px-5 py-3">Tür</th>
          <th className="px-5 py-3">Tarih</th>
          <th className="px-5 py-3">Not</th>
          <th className="px-5 py-3">Durum</th>
        </tr>
      </thead>
      <tbody>
        {leaves.map((l) => (
          <tr key={l.id} className="border-b">
            <td className="px-5 py-3 text-sm text-gray-900">{l.leaveType}</td>
            <td className="px-5 py-3 text-sm text-gray-600">{l.startDate} / {l.endDate}</td>
            <td className="px-5 py-3 text-sm text-gray-500">{l.description}</td>
            <td className="px-5 py-3 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{l.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}