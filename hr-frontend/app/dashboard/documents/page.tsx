"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DocumentRequest } from "../../../types";
import { documentService } from "../../../services/documentService";

export default function DocumentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("MY_DOCS"); // MY_DOCS veya HR_PANEL
  const [role, setRole] = useState("USER");
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [token, setToken] = useState("");

  // Veriler
  const [myDocuments, setMyDocuments] = useState<DocumentRequest[]>([]);
  const [poolDocuments, setPoolDocuments] = useState<DocumentRequest[]>([]); // Sahipsiz işler

  // Form Verileri
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ documentType: "CALISMA_BELGESI", description: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    const empId = localStorage.getItem("employeeId");

    if (!token) {
      router.push("/");
      return;
    }
    
    if(userRole) setRole(userRole);
    
    if(empId) {
        const id = Number(empId);
        setCurrentUserId(id);
        fetchMyDocuments(id);
    }
  }, [router]);

  // --- API ÇAĞRILARI ---

  const fetchMyDocuments = async (empId: number) => {
    try {
      const data = await documentService.getByEmployee(empId);
      setMyDocuments(data);
    } catch (err) { console.error(err); }
  };

  const fetchDocumentPool = async () => {
    try {
      const data = await documentService.getPool();
      setPoolDocuments(data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await documentService.create({ employeeId: currentUserId, ...formData } as any);
      alert("Talep iletildi!");
      // ... modal kapat ...
      fetchMyDocuments(currentUserId);
    } catch (err) { alert("Hata oluştu"); }
  };

  const handleClaim = async (docId: number) => {
    try {
      await documentService.claim(docId, currentUserId);
      alert("İş üzerinize alındı!");
      fetchDocumentPool();
    } catch (err) { alert("İşlem başarısız"); }
  };

  // 5. İK: İşi Tamamla (Complete)
  // Not: Bu fonksiyonu havuzda göstermiyoruz çünkü havuzda sadece sahipsizler var.
  // Gerçek senaryoda "Üzerimdeki İşler" tablosunda bu butonu gösteririz.
  // Demo için Claim butonuna basınca otomatik tamamlanmış gibi yapalım veya konsola yazalım.

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Belge Talep Yönetimi</h1>
        <button onClick={() => router.push("/dashboard")} className="text-gray-600">← Geri</button>
      </div>

      {/* SEKMELER */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium ${activeTab === "MY_DOCS" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("MY_DOCS")}
        >
          📄 Belgelerim
        </button>
        {(role === "ADMIN" || role === "HR") && (
          <button
            className={`px-6 py-3 font-medium ${activeTab === "HR_PANEL" ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500"}`}
            onClick={() => {
              setActiveTab("HR_PANEL");
              fetchDocumentPool();
            }}
          >
            📂 İK İş Havuzu
          </button>
        )}
      </div>

      {/* 1. SEKME: BELGELERİM */}
      {activeTab === "MY_DOCS" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 shadow">
              + Belge Talep Et
            </button>
          </div>
          <DocumentTable docs={myDocuments} showActions={false} />
        </div>
      )}

      {/* 2. SEKME: İK PANELİ (HAVUZ) */}
      {activeTab === "HR_PANEL" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-700">Bekleyen Talepler Havuzu</h3>
          <p className="text-sm text-gray-500 mb-4">Bu listede henüz bir İK uzmanı tarafından atanmamış işler listelenir.</p>

          {poolDocuments.length === 0 ? <p className="text-gray-400">Havuzda bekleyen iş yok.</p> : (
            <table className="min-w-full">
              <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                <tr>
                  <th className="p-3">Personel ID</th>
                  <th className="p-3">Belge Türü</th>
                  <th className="p-3">Açıklama</th>
                  <th className="p-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {poolDocuments.map(doc => (
                  <tr key={doc.id} className="border-b">
                    <td className="p-3 font-bold">#{doc.employeeId}</td>
                    <td className="p-3">{doc.documentType}</td>
                    <td className="p-3 text-gray-600">{doc.description}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleClaim(doc.id)}
                        className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                      >
                        ⚡ İşi Üzerine Al
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow w-96">
            <h2 className="font-bold text-xl mb-4">Talep Oluştur</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-2"><label className="block text-sm">Tür</label><select className="w-full border p-2" value={formData.documentType} onChange={e => setFormData({ ...formData, documentType: e.target.value })}><option value="CALISMA_BELGESI">Çalışma Belgesi</option><option value="VIZE">Vize Yazısı</option></select></div>
              <div className="mb-4"><label className="block text-sm">Açıklama</label><textarea className="w-full border p-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 px-3 py-1 rounded">İptal</button><button type="submit" className="bg-purple-600 text-white px-3 py-1 rounded">Gönder</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Yardımcı Tablo
function DocumentTable({ docs, showActions }: { docs: DocumentRequest[], showActions: boolean }) {
  if (docs.length === 0) return <p className="text-gray-500">Kayıt yok.</p>;
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
          <tr><th className="p-3">Tür</th><th className="p-3">Açıklama</th><th className="p-3">Durum</th></tr>
        </thead>
        <tbody>
          {docs.map(d => (
            <tr key={d.id} className="border-b">
              <td className="p-3 font-medium">{d.documentType}</td>
              <td className="p-3 text-gray-600">{d.description}</td>
              <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{d.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}