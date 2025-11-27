"use client";

import { useEffect, useState } from "react";
import { leaveService } from "../../../../services/leaveService";
import { LeaveRequest } from "../../../../types";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Modal from "../../../../components/ui/Modal";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import DataTable, { Column } from "../../../../components/ui/Table";

export default function LeavesView() {
  const [activeTab, setActiveTab] = useState("MY_LEAVES");
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("USER");

  const [formData, setFormData] = useState({
    leaveType: "YILLIK",
    startDate: "",
    endDate: "",
    description: "",
  });

  const LEAVE_TYPES = [
    { value: "YILLIK", label: "Yıllık İzin" },
    { value: "MAZERET", label: "Mazeret İzni" },
    { value: "SAGLIK", label: "Sağlık İzni" },
  ];

  useEffect(() => {
    setRole(localStorage.getItem("role") || "USER");
    fetchData("MY_LEAVES");
  }, []);

  const fetchData = async (tab: string) => {
    const empId = Number(localStorage.getItem("employeeId"));
    try {
      const data =
        tab === "MANAGER"
          ? await leaveService.getPending()
          : await leaveService.getByEmployee(empId);
      setLeaves(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    const empId = Number(localStorage.getItem("employeeId"));
    await leaveService.create({ employeeId: empId, ...formData } as any);
    setShowModal(false);
    fetchData(activeTab);
  };

  const handleApprove = async (id: number, status: "APPROVED" | "REJECTED") => {
    await leaveService.updateStatus(id, status);
    fetchData(activeTab);
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: "Tür",
      accessorKey: "leaveType",
      className: "font-medium",
    },
    {
      header: "Tarihler",
      // cell fonksiyonu tüm satır verisine (req) erişebilir
      cell: (req) => (
        <span className="text-gray-600">
          {req.startDate} / {req.endDate}
        </span>
      ),
    },
    {
      header: "Durum",
      cell: (req) => {
        const variant =
          req.status === "APPROVED" ? "success" : req.status === "REJECTED" ? "danger" : "warning";
        return <Badge variant={variant}>{req.status}</Badge>;
      },
    },
    {
      header: "İşlem",
      className: "text-right",
      // Sadece Yönetici sekmesindeyken butonları göster
      cell: (req) =>
        activeTab === "MANAGER" ? (
          <div className="flex justify-end gap-2">
            <Button variant="success" size="sm" onClick={() => handleApprove(req.id, "APPROVED")}>
              Onayla
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleApprove(req.id, "REJECTED")}>
              Reddet
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">İzin Yönetimi</h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "MY_LEAVES" ? "primary" : "outline"}
            onClick={() => {
              setActiveTab("MY_LEAVES");
              fetchData("MY_LEAVES");
            }}
          >
            İzinlerim
          </Button>
          {(role === "ADMIN" || role === "MANAGER") && (
            <Button
              variant={activeTab === "MANAGER" ? "primary" : "outline"}
              onClick={() => {
                setActiveTab("MANAGER");
                fetchData("MANAGER");
              }}
            >
              Yönetim
            </Button>
          )}
        </div>
      </div>

      <Card>
        {activeTab === "MY_LEAVES" && (
          <div className="p-4 flex justify-end">
            <Button onClick={() => setShowModal(true)}>+ Talep Oluştur</Button>
          </div>
        )}

        <DataTable data={leaves} columns={columns} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="İzin Talebi"
        footer={<Button onClick={handleCreate}>Gönder</Button>}
      >
        <Select
          label="Tür"
          options={LEAVE_TYPES}
          value={formData.leaveType}
          onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
        />
        <Input
          type="date"
          label="Başlangıç"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />
        <Input
          type="date"
          label="Bitiş"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
