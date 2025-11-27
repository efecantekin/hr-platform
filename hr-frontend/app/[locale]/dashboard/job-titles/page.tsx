"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jobTitleService, JobTitle } from "../../../../services/jobTitleService";

export default function JobTitlesPage() {
  const router = useRouter();
  
  // --- STATE TANIMLARI ---
  const [list, setList] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Arama State'i
  const [searchTerm, setSearchTerm] = useState("");

  // Form State'leri
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState(""); // Unvan için 'title' kullanıyoruz

  // --- BAŞLANGIÇ ---
  useEffect(() => {
    const role = localStorage.getItem("role");
    // Güvenlik: Sadece ADMIN girebilir
    if (role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchList();
  }, [router]);

  // Veri Çekme
  const fetchList = async () => {
    try {
      const data = await jobTitleService.getAll();
      setList(data);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  // Kayıt (Ekleme/Güncelleme)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update metodu serviste varsa burayı açabilirsin:
      /* if (editingId) {
        await jobTitleService.update(editingId, title);
        alert("Güncellendi!");
      } else { 
      */
        await jobTitleService.create(title);
        alert("Unvan başarıyla eklendi!");
      // }

      closeModal();
      fetchList(); // Listeyi yenile
    } catch (err) {
      console.error(err);
      alert("İşlem başarısız!");
    }
  };

  // Silme İşlemi
  const handleDelete = async (id: number) => {
    if(!confirm("Bu unvanı silmek istediğinize emin misiniz?")) return;
    
    try {
      await jobTitleService.delete(id);
      fetchList();
    } catch (err) {
      alert("Hata: Bu unvan bir çalışan tarafından kullanılıyor olabilir.");
    }
  };

  // Modal Aç/Kapa
  const openModal = (item?: JobTitle) => {
    if (item) {
      setEditingId(item.id);
      setTitle(item.title);
    } else {
      setEditingId(null);
      setTitle("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setTitle("");
  };

  // --- FİLTRELEME MANTIĞI (Client-Side Search) ---
  const filteredList = list.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ÜST BAŞLIK VE GERİ BUTONU */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Unvan (Job Title) Yönetimi</h1>
        <div className="flex gap-2">
            <button 
                onClick={() => openModal()} 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow transition"
            >
                + Yeni Unvan
            </button>
        </div>
      </div>

      {/* ARAMA KUTUSU */}
      <div className="mb-4 w-full max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="🔍 Unvan ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 text-black"
        />
      </div>

      {/* TABLO */}
      <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-3xl mx-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="px-5 py-3">Unvan Adı</th>
              <th className="px-5 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                <td className="px-5 py-4 text-right flex justify-end gap-3">
                  {/* Düzenleme butonu backend desteği gelirse açılabilir */}
                  {/* <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">Düzenle</button> */}
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredList.length === 0 && <div className="p-4 text-center text-gray-500">Kayıt bulunamadı.</div>}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editingId ? "Unvanı Düzenle" : "Yeni Unvan Ekle"}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Unvan Adı</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full border p-2 rounded text-black focus:outline-none focus:border-indigo-500"
                    placeholder="Örn: Senior Developer"
                    required 
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                    type="button" 
                    onClick={closeModal} 
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                    İptal
                </button>
                <button 
                    type="submit" 
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow"
                >
                    {editingId ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}