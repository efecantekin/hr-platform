"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { departmentService, Department } from "../../../services/departmentService";

export default function DepartmentsPage() {
  const router = useRouter();
  
  // State Tanımları
  const [list, setList] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchList();
  }, [router]);

  const fetchList = async () => {
    try {
      const data = await departmentService.getAll();
      setList(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Eğer update metodunu servise eklediysen burayı açabilirsin
      /* if (editingId) {
        await departmentService.update(editingId, name);
        alert("Güncellendi!");
      } else { */
        await departmentService.create(name);
        alert("Eklendi!");
      // }
      closeModal();
      fetchList();
    } catch (err) { alert("İşlem başarısız!"); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Bu departmanı silmek istediğinize emin misiniz?")) return;
    try {
      await departmentService.delete(id);
      fetchList();
    } catch (err) { alert("Hata: Departman kullanımda olabilir."); }
  };

  const openModal = (item?: Department) => {
    if (item) {
      setEditingId(item.id);
      setName(item.name);
    } else {
      setEditingId(null);
      setName("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setName("");
  };

  const filteredList = list.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* BAŞLIK VE BUTONLAR */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departman Yönetimi</h1>
        <div className="flex gap-2">
            <button onClick={() => router.push("/dashboard")} className="text-gray-600 px-4 hover:text-gray-900">← Geri</button>
            <button 
                onClick={() => openModal()} 
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow transition"
            >
                + Yeni Departman
            </button>
        </div>
      </div>

      {/* ARAMA ALANI */}
      <div className="mb-4 w-full max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="🔍 Departman ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-teal-500 text-black"
        />
      </div>

      {/* TABLO */}
      <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-3xl mx-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="px-5 py-3">Departman Adı</th>
              <th className="px-5 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-5 py-4 text-right flex justify-end gap-3">
                  {/* Düzenle butonu şimdilik pasif, backend update yazılınca açılabilir */}
                  {/* <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 text-sm">Düzenle</button> */}
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="p-4 text-center text-gray-500">Henüz kayıt yok.</div>}
      </div>

      {/* MODAL (POP-UP) */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-fade-in-down">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingId ? "Departmanı Düzenle" : "Yeni Departman Ekle"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Departman Adı</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full border p-2 rounded text-black focus:outline-none focus:border-teal-500"
                    placeholder="Örn: İnsan Kaynakları"
                    required 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">İptal</button>
                <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}