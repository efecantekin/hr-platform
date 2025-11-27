"use client";

import { useEffect, useState } from "react";
import { positionService } from "../../../../services/positionService";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Card from "../../../../components/ui/Card";
import Modal from "../../../../components/ui/Modal";
import DataTable, { Column } from "../../../../components/ui/Table";
import { JobTitle, Position } from "../../../../types";

export default function PositionsView() {
  const [list, setList] = useState<Position[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const data = await positionService.getAll();
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    try {
      await positionService.create(title);
      setShowModal(false);
      setTitle("");
      fetchList();
    } catch (err) {
      alert("İşlem başarısız!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu pozisyonu silmek istediğinize emin misiniz?")) return;
    try {
      await positionService.delete(id);
      fetchList();
    } catch (err) {
      alert("Hata: Bu pozisyon kullanımda olabilir.");
    }
  };

  // Client-side Arama
  const filtered = list.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  // --- KOLONLAR ---
  const columns: Column<JobTitle>[] = [
    {
      header: "Departman Adı",
      accessorKey: "title",
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pozisyon Yönetimi</h1>
        <Button onClick={() => setShowModal(true)}>+ Yeni Pozisyon</Button>
      </div>

      <div className="mb-4 max-w-md mx-auto">
        <Input
          placeholder="🔍 Pozisyon ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="max-w-3xl mx-auto">
        <DataTable data={filtered} columns={columns} emptyMessage="Departman bulunamadı." />
      </Card>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yeni Pozisyon Ekle"
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
          label="Pozisyon Adı"
          placeholder="Örn: İK Yöneticisi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Modal>
    </div>
  );
}
