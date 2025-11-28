"use client";

import { useEffect, useState } from "react";
import { jobTitleService, JobTitle } from "../services/jobTitleService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import DataTable, { Column } from "../components/ui/Table";

export default function JobTitlesView() {
  // State Tanımları
  const [list, setList] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form ve Arama State'leri
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");

  // Sayfa Yüklendiğinde Veriyi Çek
  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const data = await jobTitleService.getAll();
      setList(data);
    } catch (err) {
      console.error("Veri hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  // Yeni Kayıt Ekleme
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Lütfen bir unvan giriniz.");
      return;
    }

    try {
      await jobTitleService.create(title);
      setShowModal(false); // Modalı kapat
      setTitle(""); // Formu temizle
      fetchList(); // Listeyi yenile
      alert("Unvan başarıyla eklendi!");
    } catch (err) {
      alert("Ekleme işlemi başarısız!");
    }
  };

  // Silme İşlemi
  const handleDelete = async (id: number) => {
    if (!confirm("Bu unvanı silmek istediğinize emin misiniz?")) return;

    try {
      await jobTitleService.delete(id);
      fetchList();
    } catch (err) {
      alert("Hata: Bu unvan şu an bir çalışan tarafından kullanılıyor olabilir.");
    }
  };

  // Client-Side Filtreleme (Arama)
  const filteredList = list.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // --- TABLO KOLON TANIMLARI ---
  const columns: Column<JobTitle>[] = [
    {
      header: "Unvan Adı",
      accessorKey: "title", // JobTitle objesinde 'title' alanı var
      className: "font-medium text-gray-900",
    },
    {
      header: "İşlem",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
            Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* BAŞLIK VE BUTON */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Unvan (Job Title) Yönetimi</h1>
        <Button onClick={() => setShowModal(true)}>+ Yeni Unvan</Button>
      </div>

      {/* ARAMA ALANI */}
      <div className="mb-4 max-w-md mx-auto">
        <Input
          placeholder="🔍 Unvan ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLO */}
      <div className="max-w-3xl mx-auto">
        <Card>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
          ) : (
            <DataTable
              data={filteredList}
              columns={columns}
              emptyMessage="Kayıtlı unvan bulunamadı."
            />
          )}
        </Card>
      </div>

      {/* EKLEME MODALI */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yeni Unvan Ekle"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>Kaydet</Button>
          </>
        }
      >
        <Input
          label="Unvan Adı"
          placeholder="Örn: Senior Developer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Modal>
    </div>
  );
}
