"use client";

import { useEffect, useState } from "react";
import { leaveService } from "../../../../services/leaveService";
import { employeeService } from "../../../../services/employeeService"; // Eklendi
import { LeaveRequest, Employee } from "../../../../types";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Modal from "../../../../components/ui/Modal";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import DataTable, { Column } from "../../../../components/ui/Table";
import Loading from "../../../../components/ui/Loading";

export default function LeavesView() {
  // Sekme Kontrolleri
  const [activeTab, setActiveTab] = useState<string>("MY_LEAVES");
  const [managerView, setManagerView] = useState<string>("PENDING"); // PENDING veya TEAM

  // Veri State'leri
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]); // Benim veya Onay Bekleyenler
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]); // Ekip Listesi
  const [selectedMemberLeaves, setSelectedMemberLeaves] = useState<LeaveRequest[]>([]); // Seçilen personelin izinleri
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [selectedMemberLeavesLoading, setSelectedMemberLeavesLoading] = useState(true);
  const [memberListLoading, setMemberListLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("USER");
  const [currentUserId, setCurrentUserId] = useState<number>(0);

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
    const r = localStorage.getItem("role");
    const empId = Number(localStorage.getItem("employeeId"));
    setRole(r || "USER");
    setCurrentUserId(empId);

    // İlk açılışta benim izinlerimi getir
    fetchMyLeaves(empId);
  }, []);

  // --- VERİ ÇEKME FONKSİYONLARI ---

  const fetchMyLeaves = async (empId: number) => {
    setLeavesLoading(true);
    try {
      const data = await leaveService.getByEmployee(empId);
      setLeaves(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLeavesLoading(false);
    }
  };

  const fetchPendingLeaves = async () => {
    setLeavesLoading(true);
    try {
      const data = await leaveService.getPending();
      setLeaves(data); // Ana tabloyu güncelle
    } catch (e) {
      console.error(e);
    } finally {
      setLeavesLoading(false);
    }
  };

  const fetchMyTeam = async () => {
    setMemberListLoading(true);
    try {
      const data = await employeeService.getMyTeam(currentUserId);
      setTeamMembers(data);
      setSelectedMemberLeaves([]); // Seçimi sıfırla
      setSelectedMemberName("");
    } catch (e) {
      console.error(e);
    } finally {
      setMemberListLoading(false);
    }
  };

  const fetchMemberHistory = async (memberId: number, memberName: string) => {
    setSelectedMemberLeavesLoading(true);
    try {
      const data = await leaveService.getByEmployee(memberId);
      setSelectedMemberLeaves(data);
      setSelectedMemberName(memberName);
    } catch (e) {
      console.error(e);
    } finally {
      setSelectedMemberLeavesLoading(false);
    }
  };

  // --- İŞLEMLER ---

  const handleCreate = async () => {
    await leaveService.create({ employeeId: currentUserId, ...formData } as any);
    setShowModal(false);
    fetchMyLeaves(currentUserId);
  };

  const handleApprove = async (id: number, status: "APPROVED" | "REJECTED") => {
    await leaveService.updateStatus(id, status);
    fetchPendingLeaves(); // Listeyi yenile
  };

  // --- TABLO KOLONLARI ---

  // 1. Standart İzin Kolonları (Benim ve Onay Bekleyenler için)
  const columns: Column<LeaveRequest>[] = [
    { header: "Tür", accessorKey: "leaveType", className: "font-medium" },
    {
      header: "Tarihler",
      cell: (req) => (
        <span className="text-gray-600 text-sm">
          {req.startDate} / {req.endDate}
        </span>
      ),
    },
    { header: "Açıklama", accessorKey: "description", className: "text-gray-500" },
    {
      header: "Durum",
      cell: (req) => (
        <Badge
          variant={
            req.status === "APPROVED" ? "success" : req.status === "REJECTED" ? "danger" : "warning"
          }
        >
          {req.status}
        </Badge>
      ),
    },
    {
      header: "İşlem",
      className: "text-right",
      cell: (req) =>
        activeTab === "MANAGER" && managerView === "PENDING" ? (
          <div className="flex justify-end gap-2">
            <Button variant="success" size="sm" onClick={() => handleApprove(req.id, "APPROVED")}>
              ✓
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleApprove(req.id, "REJECTED")}>
              ✕
            </Button>
          </div>
        ) : null,
    },
  ];

  // 2. Ekip Geçmişi Kolonları (Basitleştirilmiş)
  const historyColumns: Column<LeaveRequest>[] = [
    { header: "Tür", accessorKey: "leaveType" },
    { header: "Tarih", cell: (r) => `${r.startDate} - ${r.endDate}` },
    {
      header: "Durum",
      cell: (r) => (
        <Badge variant={r.status === "APPROVED" ? "success" : "warning"}>{r.status}</Badge>
      ),
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
              fetchMyLeaves(currentUserId);
            }}
          >
            İzinlerim
          </Button>
          {(role === "ADMIN" || role === "MANAGER") && (
            <Button
              variant={activeTab === "MANAGER" ? "primary" : "outline"}
              onClick={() => {
                setActiveTab("MANAGER");
                setManagerView("PENDING");
                fetchPendingLeaves();
              }}
            >
              Yönetim Paneli
            </Button>
          )}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* YÖNETİCİ ALT MENÜSÜ */}
        {activeTab === "MANAGER" && (
          <div className="flex border-b bg-gray-50 p-2 gap-2">
            <button
              onClick={() => {
                setManagerView("PENDING");
                fetchPendingLeaves();
              }}
              className={`px-4 py-2 text-sm rounded ${
                managerView === "PENDING"
                  ? "bg-white shadow text-primary font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ⏳ Onay Bekleyenler
            </button>
            <button
              onClick={() => {
                setManagerView("TEAM");
                fetchMyTeam();
              }}
              className={`px-4 py-2 text-sm rounded ${
                managerView === "TEAM"
                  ? "bg-white shadow text-primary font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              👥 Ekibim ve Geçmiş
            </button>
          </div>
        )}

        {/* İÇERİK ALANI */}
        <div className="p-4">
          {/* 1. DURUM: Benim İzinlerim veya Onay Bekleyenler */}
          {(activeTab === "MY_LEAVES" ||
            (activeTab === "MANAGER" && managerView === "PENDING")) && (
            <>
              {activeTab === "MY_LEAVES" && (
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowModal(true)}>+ Talep Oluştur</Button>
                </div>
              )}
              {leavesLoading ? (
                <Loading />
              ) : (
                <DataTable data={leaves} columns={columns} emptyMessage="İzin kaydı bulunamadı." />
              )}
            </>
          )}

          {/* 2. DURUM: Ekip Görüntüleme (Split Screen) */}
          {activeTab === "MANAGER" && managerView === "TEAM" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
              {/* SOL: Personel Listesi */}
              {memberListLoading ? (
                <Loading />
              ) : (
                <div className="col-span-1 border-r pr-4 overflow-y-auto custom-scrollbar">
                  <h3 className="font-bold text-gray-700 mb-3 sticky top-0 bg-white pb-2">
                    Ekip Üyeleri
                  </h3>
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-gray-400">Ekibinizde kimse yok.</p>
                  ) : (
                    <ul className="space-y-2">
                      {teamMembers.map((emp) => (
                        <li
                          key={emp.id}
                          onClick={() =>
                            fetchMemberHistory(emp.id, `${emp.firstName} ${emp.lastName}`)
                          }
                          className={`p-3 rounded cursor-pointer border transition ${
                            selectedMemberName === `${emp.firstName} ${emp.lastName}`
                              ? "bg-blue-50 border-blue-200 shadow-sm"
                              : "bg-white border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          <div className="font-medium text-gray-800">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {emp.jobTitle || emp.department}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {/* SAĞ: Seçilen Kişinin Geçmişi */}
              <div className="col-span-2 overflow-y-auto">
                <h3 className="font-bold text-gray-700 mb-3 sticky top-0 bg-white pb-2">
                  {selectedMemberName ? `${selectedMemberName} - İzin Geçmişi` : "Detay"}
                </h3>

                {!selectedMemberName ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                    <span className="text-4xl mb-2">👈</span>
                    <p>Soldan bir çalışan seçin.</p>
                  </div>
                ) : selectedMemberLeavesLoading ? (
                  <Loading />
                ) : (
                  <DataTable
                    data={selectedMemberLeaves}
                    columns={historyColumns}
                    emptyMessage="Bu çalışanın geçmiş izin kaydı yok."
                  />
                )}
              </div>
            </div>
          )}
        </div>
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
