"use client";

import { useEffect, useState } from "react";
import { candidateService } from "../../../../services/candidateService";
import { departmentService } from "../../../../services/departmentService"; // YENİ
import { Candidate } from "../../../../types";

// UI Bileşenleri
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import Modal from "../../../../components/ui/Modal";
import Badge from "../../../../components/ui/Badge";
import DataTable, { Column } from "../../../../components/ui/Table";
import MultiSelect from "../../../../components/ui/MultiSelect"; // YENİ BİLEŞEN

export default function CandidatesView() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Data State
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);

  // Modal ve Form
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Filtre
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    technologies: "",
    experienceYears: "",
    university: "",
    department: "",
    referenceType: "",
  });

  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    technologies: "",
    experienceYears: 0,
    previousCompanies: "",
    university: "",
    department: "", // Alan (Departman)
    referenceType: "EXTERNAL",
    referenceName: "",
    status: "HAVUZ",
  };
  const [formData, setFormData] = useState<Partial<Candidate>>(initialFormState);

  // SABİT LİSTELER
  const STATUS_OPTIONS = [
    { value: "HAVUZ", label: "Aday Havuzu" },
    { value: "TELEFON", label: "Telefon Görüşmesi" },
    { value: "TEKNIK", label: "Teknik Mülakat" },
    { value: "IK_MULAKAT", label: "İK Mülakatı" },
    { value: "TEKLIF", label: "Teklif Aşamasında" },
    { value: "ISE_ALINDI", label: "İşe Alındı" },
    { value: "RED", label: "Olumsuz / Red" },
  ];

  const REF_TYPES = [
    { value: "INTERNAL", label: "İç Referans" },
    { value: "EXTERNAL", label: "Dış Başvuru / Kariyer" },
  ];

  // TEKNOLOJİ LİSTESİ (Sanal Veri)
  const TECH_STACK = [
    "Java",
    "Spring Boot",
    "React",
    "Next.js",
    "Angular",
    "Vue",
    "Node.js",
    "Docker",
    "Kubernetes",
    "AWS",
    "Python",
    "Go",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "C#",
    ".NET Core",
    "TypeScript",
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [candidateData, deptData] = await Promise.all([
        candidateService.search(filters),
        departmentService.getAll(),
      ]);
      setCandidates(candidateData);
      setDepartments(deptData.map((d) => ({ value: d.name, label: d.name })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const data = await candidateService.search(filters);
    setCandidates(data);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (candidate: Candidate) => {
    setIsEditing(true);
    setEditingId(candidate.id);
    setFormData(candidate);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await candidateService.update(editingId, formData);
        alert("Aday güncellendi.");
      } else {
        await candidateService.create(formData);
        alert("Aday eklendi.");
      }
      setShowModal(false);
      handleSearch();
    } catch (error) {
      alert("İşlem başarısız!");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const columns: Column<Candidate>[] = [
    {
      header: "Ad Soyad",
      cell: (c) => (
        <span className="font-bold text-gray-900">
          {c.firstName} {c.lastName}
        </span>
      ),
    },
    {
      header: "Tecrübe",
      accessorKey: "experienceYears",
      cell: (c) => <span className="text-gray-600">{c.experienceYears} Yıl</span>,
    },

    // ALANI (DEPARTMAN) BADGE OLARAK GÖSTERELİM
    { header: "Alanı", cell: (c) => <Badge variant="neutral">{c.department}</Badge> },

    // TEKNOLOJİLER (VİRGÜLLE AYRILMIŞ LİSTE)
    {
      header: "Teknolojiler",
      cell: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.technologies
            ?.split(",")
            .slice(0, 3)
            .map((t) => (
              <span
                key={t}
                className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100"
              >
                {t}
              </span>
            ))}
          {c.technologies?.split(",").length > 3 && (
            <span className="text-[10px] text-gray-400">...+</span>
          )}
        </div>
      ),
    },

    {
      header: "",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" onClick={() => openEditModal(c)} className="!px-3">
            👁️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Aday Havuzu</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Gizle" : "🔍 Filtrele"}
          </Button>
          <Button onClick={openCreateModal}>+ Yeni Aday</Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6 border-blue-100 border-2">
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Teknoloji"
              value={filters.technologies}
              onChange={(e) => setFilters({ ...filters, technologies: e.target.value })}
            />
            <Select
              label="Alanı / Bölümü"
              options={departments}
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            />
            <Input
              label="Okul"
              value={filters.university}
              onChange={(e) => setFilters({ ...filters, university: e.target.value })}
            />
            <div className="flex items-end md:col-span-3">
              <Button onClick={handleSearch} className="w-full">
                Sonuçları Getir
              </Button>
            </div>
          </div>
        </Card>
      )}

      <DataTable data={candidates} columns={columns} emptyMessage="Aday bulunamadı." />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? "Aday Düzenle" : "Yeni Aday"}
        footer={
          <>
            {" "}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Kapat
            </Button>{" "}
            <Button onClick={handleSave}>Kaydet</Button>{" "}
          </>
        }
      >
        <form className="grid grid-cols-2 gap-4">
          <div className="col-span-2 border-b pb-1 mb-2 font-bold text-gray-700 text-sm">
            Kişisel Bilgiler
          </div>
          <Input
            name="firstName"
            label="Ad"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            name="lastName"
            label="Soyad"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <Input name="email" label="Email" value={formData.email} onChange={handleChange} />
          <Input name="phone" label="Telefon" value={formData.phone} onChange={handleChange} />

          <div className="col-span-2 border-b pb-1 mb-2 mt-4 font-bold text-gray-700 text-sm">
            Yetkinlikler
          </div>

          {/* --- ALAN (Combobox / Select) --- */}
          <Select
            name="department"
            label="Başvurduğu Alan"
            options={departments}
            value={formData.department}
            onChange={handleChange}
          />

          {/* --- TEKNOLOJİLER (MultiSelect with Search) --- */}
          <div className="col-span-2">
            <MultiSelect
              label="Teknolojiler (Ara ve Seç)"
              options={TECH_STACK}
              value={formData.technologies || ""}
              onChange={(val) => setFormData((prev) => ({ ...prev, technologies: val }))}
              placeholder="Java, React yazın..."
            />
          </div>

          <Input
            name="experienceYears"
            type="number"
            label="Tecrübe (Yıl)"
            value={formData.experienceYears}
            onChange={handleChange}
          />
          <Input
            name="previousCompanies"
            label="Önceki Şirketler"
            value={formData.previousCompanies}
            onChange={handleChange}
          />

          <div className="col-span-2 border-b pb-1 mb-2 mt-4 font-bold text-gray-700 text-sm">
            Diğer
          </div>
          <Input
            name="university"
            label="Üniversite"
            value={formData.university}
            onChange={handleChange}
          />
          <Select
            name="status"
            label="Aday Durumu"
            options={STATUS_OPTIONS}
            value={formData.status}
            onChange={handleChange}
          />
        </form>
      </Modal>
    </div>
  );
}
