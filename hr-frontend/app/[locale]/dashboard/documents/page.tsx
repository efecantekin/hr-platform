"use client";

import { useEffect, useState } from "react";
import { documentService } from "../../../../services/documentService";
import { DocumentRequest } from "../../../../types";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Modal from "../../../../components/ui/Modal";
import Badge from "../../../../components/ui/Badge";
import DataTable, { Column } from "../../../../components/ui/Table";

export default function DocumentsView() {
  // Tipi string olarak zorluyoruz
  const [activeTab, setActiveTab] = useState<string>("MY_DOCS");
  const [role, setRole] = useState("USER");
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  const [myDocuments, setMyDocuments] = useState<DocumentRequest[]>([]);
  const [poolDocuments, setPoolDocuments] = useState<DocumentRequest[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ documentType: "CALISMA_BELGESI", description: "" });

  const DOC_TYPES = [
    { value: "CALISMA_BELGESI", label: "Çalışma Belgesi" },
    { value: "VIZE_YAZISI", label: "Vize Yazısı" },
    { value: "BORDRO", label: "Maaş Bordrosu" },
  ];

  useEffect(() => {
    const role = localStorage.getItem("role");
    const empId = localStorage.getItem("employeeId");
    if (role) setRole(role);
    if (empId) {
      const id = Number(empId);
      setCurrentUserId(id);
      fetchMyDocuments(id);
    }
  }, []);

  const fetchMyDocuments = async (id: number) => {
    try {
      const data = await documentService.getByEmployee(id);
      setMyDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocumentPool = async () => {
    try {
      const data = await documentService.getPool();
      setPoolDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await documentService.create({ employeeId: currentUserId, ...formData } as any);
      alert("Talep iletildi!");
      setShowModal(false);
      fetchMyDocuments(currentUserId);
    } catch (err) {
      alert("Hata oluştu");
    }
  };

  const handleClaim = async (docId: number) => {
    try {
      await documentService.claim(docId, currentUserId);
      alert("İş üzerinize alındı!");
      fetchDocumentPool();
    } catch (err) {
      alert("İşlem başarısız");
    }
  };

  // --- KOLONLAR (Bileşenin İÇİNDE olmalı) ---
  const columns: Column<DocumentRequest>[] = [
    {
      header: "Belge Türü",
      accessorKey: "documentType",
      className: "font-medium",
    },
    {
      header: "Açıklama",
      accessorKey: "description",
      className: "text-gray-600",
    },
    {
      header: "Durum",
      cell: (doc) => (
        <Badge variant={doc.status === "DELIVERED" ? "success" : "neutral"}>{doc.status}</Badge>
      ),
    },
    {
      header: "İşlem",
      className: "text-right",
      // BURADA 'as any' KULLANARAK TYPESCRIPT'İ SUSTURUYORUZ
      cell: (doc) =>
        (activeTab as any) === "HR_PANEL" ? (
          <div className="flex justify-end">
            <Button size="sm" variant="success" onClick={() => handleClaim(doc.id)}>
              ⚡ İşi Al
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Belge Talep Yönetimi</h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "MY_DOCS" ? "primary" : "outline"}
            onClick={() => setActiveTab("MY_DOCS")}
          >
            Belgelerim
          </Button>
          {(role === "ADMIN" || role === "HR") && (
            <Button
              variant={activeTab === "HR_PANEL" ? "primary" : "outline"}
              onClick={() => {
                setActiveTab("HR_PANEL");
                fetchDocumentPool();
              }}
            >
              İK Havuzu
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded-lg border border-gray-100">
        {activeTab === "MY_DOCS" && (
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowModal(true)}>+ Yeni Talep</Button>
          </div>
        )}

        <DataTable
          data={activeTab === "MY_DOCS" ? myDocuments : poolDocuments}
          columns={columns}
          emptyMessage={activeTab === "MY_DOCS" ? "Talep bulunamadı." : "Havuzda bekleyen iş yok."}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Talep Oluştur"
        footer={<Button onClick={handleCreate}>Gönder</Button>}
      >
        <Select
          label="Tür"
          options={DOC_TYPES}
          value={formData.documentType}
          onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
        />
        <Input
          label="Açıklama"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Modal>
    </div>
  );
}
