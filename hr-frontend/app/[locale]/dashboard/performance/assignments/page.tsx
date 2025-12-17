"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Servisler
import { performanceService } from "../../../../../services/performanceService";
import { employeeService } from "../../../../../services/employeeService";

// UI Bileşenleri
import Button from "../../../../../components/ui/Button";
import Select from "../../../../../components/ui/Select";
import Input from "../../../../../components/ui/Input";
import Card from "../../../../../components/ui/Card";
import Loading from "../../../../../components/ui/Loading";

export default function PerformanceManageView() {
  const [loading, setLoading] = useState(true);

  // Dropdown Seçenekleri
  const [employees, setEmployees] = useState<{ value: string | number; label: string }[]>([]);
  const [templates, setTemplates] = useState<{ value: string | number; label: string }[]>([]);

  // Form Verileri
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Yeni Eklenen Alanlar
  const [dueDate, setDueDate] = useState("");
  const [period, setPeriod] = useState("2024-Q4");
  const [reviewType, setReviewType] = useState("MANAGER");

  // Sabit Listeler
  const REVIEW_TYPES = [
    { value: "MANAGER", label: "Yönetici Değerlendirmesi" },
    { value: "SELF", label: "Kendi Kendini Değerlendirme (Self)" },
    { value: "SUBORDINATE", label: "Ast Değerlendirmesi" },
    { value: "PEER", label: "Akran Değerlendirmesi" },
  ];

  const PERIODS = [
    { value: "2024-Q4", label: "2024 - 4. Çeyrek (Yıl Sonu)" },
    { value: "2025-Q1", label: "2025 - 1. Çeyrek" },
    { value: "2025-Q2", label: "2025 - 2. Çeyrek" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empData, tplData] = await Promise.all([
        employeeService.getAll(),
        performanceService.getAllTemplates(),
      ]);

      // Select bileşeni için value string veya number olabilir
      const empOptions = empData.map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName} (${e.jobTitle || "Çalışan"})`,
      }));

      const tplOptions = tplData.map((t) => ({
        value: t.id!,
        label: t.title,
      }));

      setEmployees(empOptions);
      setTemplates(tplOptions);
    } catch (e) {
      console.error(e);
      alert("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // 'SELF' seçilirse değerlendiren kişi otomatik olarak çalışan olur
  useEffect(() => {
    if (reviewType === "SELF" && selectedEmployee) {
      setSelectedReviewer(selectedEmployee);
    }
  }, [reviewType, selectedEmployee]);

  const handleAssign = async () => {
    // Validasyon
    if (!selectedEmployee || !selectedReviewer || !selectedTemplate || !dueDate || !period) {
      return alert("Lütfen tüm alanları (tarih ve dönem dahil) doldurunuz.");
    }

    try {
      // Servise gönderme
      await performanceService.assignReview({
        employeeId: Number(selectedEmployee),
        reviewerId: Number(selectedReviewer),
        templateId: Number(selectedTemplate),
        status: "PENDING",
        dueDate: dueDate,
        period: period,
        reviewType: reviewType as any, // Tip güvenliği için
      });

      alert("Değerlendirme ataması başarıyla yapıldı!");

      // Formu temizle (bazı alanları koruyabiliriz)
      setSelectedEmployee("");
      if (reviewType !== "SELF") setSelectedReviewer("");
      setSelectedTemplate("");
      setDueDate("");
    } catch (e) {
      console.error(e);
      alert("Atama sırasında hata oluştu.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Değerlendirme Atama</h1>

      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h2 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Yeni Atama Yap</h2>

          <div className="space-y-6">
            {/* 1. ÜST SEÇİMLER (Dönem & Tip) */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Dönem"
                options={PERIODS}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
              <Select
                label="Değerlendirme Tipi"
                options={REVIEW_TYPES}
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
              />
            </div>

            {/* 2. KİŞİ SEÇİMLERİ */}
            <Select
              label="Değerlendirilecek Çalışan"
              options={employees}
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            />

            <Select
              label="Değerlendirici (Yönetici / Müşteri)"
              options={employees}
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              disabled={reviewType === "SELF"} // Self modunda kilitli
            />

            {reviewType !== "SELF" && (
              <div className="p-3 bg-blue-50 rounded border border-blue-100 text-xs text-blue-700">
                ℹ️ Değerlendirici olarak bir yönetici seçebilir veya sisteme tanımlı bir müşteri
                temsilcisini atayabilirsiniz.
              </div>
            )}

            {/* 3. DETAYLAR (Şablon & Tarih) */}
            <Select
              label="Kullanılacak Anket Şablonu"
              options={templates}
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            />

            <Input
              type="date"
              label="Son Değerlendirme Tarihi"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <Button className="w-full mt-4" onClick={handleAssign}>
              Atamayı Tamamla
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
