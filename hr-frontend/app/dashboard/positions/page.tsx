"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { positionService, Position } from "../../../services/positionService";

export default function PositionsPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchPositions();
  }, [router]);

  const fetchPositions = async () => {
    try {
      const data = await positionService.getAll();
      setPositions(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await positionService.update(editingId, title);
        alert("Güncellendi!");
      } else {
        await positionService.create(title);
        alert("Eklendi!");
      }
      closeModal();
      fetchPositions();
    } catch (err) { alert("İşlem başarısız!"); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Bu pozisyonu silmek istediğinize emin misiniz?")) return;
    try {
      await positionService.delete(id);
      fetchPositions();
    } catch (err) { alert("Hata oluştu"); }
  };

  const openModal = (pos?: Position) => {
    if (pos) {
      setEditingId(pos.id);
      setTitle(pos.title);
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

  const filteredPositions = positions.filter((pos) =>
    pos.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pozisyon Tanımları</h1>
        <div className="flex gap-2">
            <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Yeni Pozisyon</button>
        </div>
      </div>

      {/* ARAMA ALANI */}
      <div className="mb-4 w-full max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="🔍 Pozisyon ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 text-black"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-2xl mx-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="px-5 py-3">Pozisyon Adı</th>
              <th className="px-5 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredPositions.map((pos) => (
              <tr key={pos.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{pos.title}</td>
                <td className="px-5 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openModal(pos)} className="text-blue-600 hover:text-blue-800 text-sm">Düzenle</button>
                  <button onClick={() => handleDelete(pos.id)} className="text-red-600 hover:text-red-800 text-sm">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {positions.length === 0 && <div className="p-4 text-center text-gray-500">Kayıt yok.</div>}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingId ? "Pozisyonu Düzenle" : "Yeni Pozisyon"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Pozisyon Adı</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full border p-2 rounded text-black"
                    placeholder="Örn: İK Uzmanı"
                    required 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">İptal</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Güncelle" : "Kaydet"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}