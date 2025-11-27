"use client";

import { useEffect, useState } from "react";
import { employeeService } from "../../../../services/employeeService";
import { positionService } from "../../../../services/positionService";
import { Employee, Position } from "../../../../types";
import Button from "../../../../components/ui/Button";
import Select from "../../../../components/ui/Select";
import Modal from "../../../../components/ui/Modal";
import Input from "../../../../components/ui/Input";
// YENİ İMPORT
import DataTable, { Column } from "../../../../components/ui/Table";

export default function HierarchyView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State'leri
  const [showModal, setShowModal] = useState(false);
  const [selectedSubordinate, setSelectedSubordinate] = useState<Employee | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [isPositionRequired, setIsPositionRequired] = useState(false);
  const [managerPositionInput, setManagerPositionInput] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empData, posData] = await Promise.all([
        employeeService.getAll(),
        positionService.getAll(),
      ]);
      setEmployees(empData as Employee[]);
      setPositions(posData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ... (handleAssignHierarchy ve handleManagerSelectChange kodları AYNI kalacak, buraya kopyalamadım) ...
  const handleAssignHierarchy = async (e: React.FormEvent) => {
    /* ÖNCEKİ KODUN AYNISI */
  };
  const handleManagerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    /* ÖNCEKİ KODUN AYNISI */
  };

  // Yardımcı
  const getManagerName = (managerId: number | null) => {
    if (!managerId) return <span className="text-gray-400 italic">Yöneticisi Yok</span>;
    const manager = employees.find((e) => e.id === managerId);
    return manager ? (
      <span className="font-semibold text-gray-800">
        {manager.firstName} {manager.lastName}
      </span>
    ) : (
      "Bilinmiyor"
    );
  };

  // --- KOLONLAR ---
  const columns: Column<Employee>[] = [
    {
      header: "Çalışan",
      cell: (emp) => (
        <span className="font-medium text-gray-900">
          {emp.firstName} {emp.lastName}
        </span>
      ),
    },
    {
      header: "Pozisyon / Unvan",
      cell: (emp) =>
        emp.position ? (
          <span className="text-indigo-600 font-bold">{emp.position}</span>
        ) : (
          <span className="text-gray-600">{emp.jobTitle}</span>
        ),
    },
    {
      header: "Yöneticisi",
      cell: (emp) => getManagerName(emp.managerId || null),
    },
    {
      header: "İşlem",
      className: "text-right",
      cell: (emp) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              setSelectedSubordinate(emp);
              setSelectedManagerId(emp.managerId ?? null);
              setIsPositionRequired(false);
              setManagerPositionInput(emp.position || "");
              setShowModal(true);
            }}
          >
            Atama Yap
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hiyerarşi Yönetimi</h1>
      </div>

      {/* TABLO */}
      <DataTable data={employees} columns={columns} />

      {/* ... MODAL KODLARI (ÖNCEKİNİN AYNISI, Select ve Input bileşenlerini kullanacak şekilde güncelleyebilirsin) ... */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Yönetici Seçimi">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Yönetici Seçimi</h3>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-bold text-blue-600">
                {selectedSubordinate?.firstName} {selectedSubordinate?.lastName}
              </span>{" "}
              kime raporlayacak?
            </p>

            <form onSubmit={handleAssignHierarchy}>
              {/* 1. YÖNETİCİ DROPDOWN */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Yeni Yönetici Seçin
                </label>
                <select
                  className="w-full border p-2 rounded text-gray-700 bg-white focus:outline-none focus:border-indigo-500"
                  value={selectedManagerId || ""}
                  onChange={handleManagerSelectChange}
                  required
                >
                  <option value="" disabled>
                    -- Bir Yönetici Seçin --
                  </option>
                  {employees
                    .filter((mgr) => mgr.id !== selectedSubordinate?.id)
                    .map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.firstName} {mgr.lastName}{" "}
                        {mgr.position ? `(${mgr.position})` : "(Pozisyon Yok)"}
                      </option>
                    ))}
                </select>
              </div>

              {/* 2. KOŞULLU POZİSYON DROPDOWN (Sadece yönetici pozisyonu yoksa açılır) */}
              {isPositionRequired && (
                <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
                  <label className="block text-sm font-bold text-red-700 mb-1">
                    ⚠️ Yöneticinin Pozisyonu Eksik!
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Lütfen bu yöneticiye bir pozisyon atayın:
                  </p>

                  <select
                    value={managerPositionInput}
                    onChange={(e) => setManagerPositionInput(e.target.value)}
                    className="w-full border-red-400 border-2 p-2 rounded-lg text-sm text-black bg-white focus:outline-none"
                    required
                  >
                    <option value="" disabled>
                      -- Pozisyon Seçin --
                    </option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.title}>
                        {pos.title}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 text-right">
                    <a
                      href="/dashboard/positions"
                      target="_blank"
                      className="text-xs text-blue-600 underline hover:text-blue-800"
                    >
                      + Yeni Pozisyon Tanımla
                    </a>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
