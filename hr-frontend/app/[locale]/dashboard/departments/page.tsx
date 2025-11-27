"use client";

import { useEffect, useState } from "react";
import { departmentService, Department } from "../../../../services/departmentService";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Card from "../../../../components/ui/Card";
import Modal from "../../../../components/ui/Modal";
import DataTable, { Column } from "../../../../components/ui/Table";

export default function DepartmentsView() {
  const [list, setList] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    const data = await departmentService.getAll();
    setList(data);
  };

  const handleSubmit = async () => {
    await departmentService.create(name);
    setShowModal(false);
    setName("");
    fetchList();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Silinsin mi?")) return;
    await departmentService.delete(id);
    fetchList();
  };

  const filtered = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  // --- KOLONLAR ---
  const columns: Column<Department>[] = [
    {
      header: "Departman Adı",
      accessorKey: "name",
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
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departmanlar</h1>
        <Button onClick={() => setShowModal(true)}>+ Ekle</Button>
      </div>

      <div className="mb-4 max-w-md mx-auto">
        <Input placeholder="🔍 Ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="max-w-3xl mx-auto">
        <DataTable data={filtered} columns={columns} emptyMessage="Departman bulunamadı." />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yeni Departman"
        footer={<Button onClick={handleSubmit}>Kaydet</Button>}
      >
        <Input label="Ad" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </div>
  );
}
