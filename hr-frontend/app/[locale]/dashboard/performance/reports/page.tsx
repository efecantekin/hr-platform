"use client";

import { useEffect, useState } from "react";
// src/views klasöründeyiz, bir üst klasöre çıkıp services'e gidiyoruz.
import { performanceService } from "../../../../../services/performanceService";
import { employeeService } from "../../../../../services/employeeService";
import type { PerformanceReview } from "../../../../../types";

// UI Bileşenleri - src/views'den src/components/ui'ye gidiyoruz.
import DataTable, { Column } from "../../../../../components/ui/Table";
import Button from "../../../../../components/ui/Button";
import Select from "../../../../../components/ui/Select";
import Card from "../../../../../components/ui/Card";
import Badge from "../../../../../components/ui/Badge";
import Loading from "../../../../../components/ui/Loading";

export default function PerformanceReportsView() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtreler - Servisteki alanlarla uyumlu
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedReviewer, setSelectedReviewer] = useState(""); // YENİ: Değerlendiren
  const [reviewType, setReviewType] = useState(""); // YENİ: Değerlendirme Tipi

  const PERIODS = [
    { value: "", label: "Hepsi" },
    { value: "2024-Q4", label: "2024 - 4. Çeyrek" },
    { value: "2025-Q1", label: "2025 - 1. Çeyrek" },
    { value: "2025-Q2", label: "2025 - 2. Çeyrek" },
  ];

  const STATUS_OPTS = [
    { value: "", label: "Hepsi" },
    { value: "PENDING", label: "Bekliyor" },
    { value: "COMPLETED", label: "Tamamlandı" },
  ];

  // YENİ: Değerlendirme Tipleri
  const REVIEW_TYPES = [
    { value: "", label: "Hepsi" },
    { value: "MANAGER", label: "Yönetici Değerlendirmesi" },
    { value: "SELF", label: "Kendi Kendini Değerlendirme (Self)" },
    { value: "SUBORDINATE", label: "Ast Değerlendirmesi" },
    { value: "PEER", label: "Akran Değerlendirmesi" },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Sayfa açılışında çalışanları çek ve varsayılan filtreyle arama yap
      const data = await employeeService.getAll();
      setEmployees(
        data.map((e) => ({ value: String(e.id), label: `${e.firstName} ${e.lastName}` }))
      );
      handleSearch();
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // undefined değerlerin gönderilmemesi için kontrol
      const filters: any = {
        period: period || undefined,
        status: status || undefined,
        employeeId: selectedEmployee ? Number(selectedEmployee) : undefined,
        reviewerId: selectedReviewer ? Number(selectedReviewer) : undefined,
        reviewType: reviewType || undefined,
      };

      const data = await performanceService.searchReviews(filters);
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<PerformanceReview>[] = [
    { header: "Dönem", accessorKey: "period", className: "w-24" },
    { header: "Anket", accessorKey: "templateTitle" },
    { header: "Çalışan ID", accessorKey: "employeeId" },
    { header: "Değerlendiren ID", accessorKey: "reviewerId" },
    { header: "Tip", accessorKey: "reviewType" },
    {
      header: "Durum",
      cell: (r) => (
        <Badge variant={r.status === "COMPLETED" ? "success" : "warning"}>{r.status}</Badge>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Performans Raporları</h1>

      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* DÖNEM */}
          <Select
            label="Dönem"
            options={PERIODS}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />

          {/* ÇALIŞAN */}
          <Select
            label="Değerlendirilen Çalışan"
            options={[{ value: "", label: "Hepsi" }, ...employees]}
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          />

          {/* YENİ: DEĞERLENDİREN */}
          <Select
            label="Değerlendiren (Yönetici)"
            options={[{ value: "", label: "Hepsi" }, ...employees]}
            value={selectedReviewer}
            onChange={(e) => setSelectedReviewer(e.target.value)}
          />

          {/* YENİ: TİP */}
          <Select
            label="Değerlendirme Tipi"
            options={REVIEW_TYPES}
            value={reviewType}
            onChange={(e) => setReviewType(e.target.value)}
          />

          {/* DURUM */}
          <Select
            label="Durum"
            options={STATUS_OPTS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          {/* FİLTRELE BUTONU */}
          <Button onClick={handleSearch} className="h-10 mb-4 w-full">
            Filtrele
          </Button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <Loading />
        ) : (
          <DataTable data={reviews} columns={columns} emptyMessage="Kayıt bulunamadı." />
        )}
      </Card>
    </div>
  );
}
