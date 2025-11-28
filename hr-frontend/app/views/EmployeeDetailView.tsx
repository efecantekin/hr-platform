"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeService } from "../../services/employeeService";
import { departmentService } from "../../services/departmentService";
import { jobTitleService } from "../../services/jobTitleService";
import { Employee } from "../../types";
import { positionService } from "../../services/positionService";
// UI Components
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import Loading from "../../components/ui/Loading";

export default function EmployeeDetailView({ employeeId }: { employeeId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Data States
  const [employee, setEmployee] = useState<Employee | null>(null);

  // Dropdown Listeleri
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [jobTitles, setJobTitles] = useState<{ value: string; label: string }[]>([]);
  const [positions, setPositions] = useState<{ value: string; label: string }[]>([]); // <--- YENİ STATE

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    try {
      // Tüm verileri paralel çekiyoruz (Pozisyonlar dahil)
      const [emp, deptData, titleData, posData] = await Promise.all([
        employeeService.getById(employeeId),
        departmentService.getAll(),
        jobTitleService.getAll(),
        positionService.getAll(), // <--- POZİSYONLARI ÇEK
      ]);

      setEmployee(emp);
      setFormData(emp);

      // Select formatına dönüştürme ({value, label})
      setDepartments(deptData.map((d) => ({ value: d.name, label: d.name })));
      setJobTitles(titleData.map((t) => ({ value: t.title, label: t.title })));
      setPositions(posData.map((p) => ({ value: p.title, label: p.title }))); // <--- FORMATLA
    } catch (error) {
      console.error("Hata:", error);
      alert("Veri yüklenirken hata oluştu.");
      router.push("/dashboard/employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await employeeService.update(employeeId, formData);
      alert("Bilgiler güncellendi!");
      setIsEditing(false);
      loadData(); // Güncel veriyi tekrar çek
    } catch (error) {
      alert("Güncelleme başarısız!");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <Loading />;
  if (!employee) return <div>Kayıt yok.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ÜST BAŞLIK */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm text-gray-500">Personel Kartı #{employee.id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(employee);
                }}
              >
                İptal
              </Button>
              <Button onClick={handleSave} isLoading={saving}>
                Kaydet
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Düzenle
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* SOL: PROFİL KARTI */}
        <div className="col-span-1">
          <Card className="p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {employee.firstName.charAt(0)}
              {employee.lastName.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-gray-500">{employee.jobTitle}</p>
            <div className="mt-4 inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {employee.department}
            </div>
          </Card>
        </div>

        {/* SAĞ: DETAYLI BİLGİLER / FORM */}
        <div className="col-span-2">
          <Card className="p-6">
            <h3 className="font-bold text-lg text-gray-700 mb-4 border-b pb-2">
              Kişisel & Kurumsal Bilgiler
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* AD & SOYAD (Input Kalacak) */}
              <InfoField label="Ad" isEditing={isEditing}>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} />
              </InfoField>

              <InfoField label="Soyad" isEditing={isEditing}>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} />
              </InfoField>

              <InfoField label="Email" isEditing={isEditing}>
                <Input name="email" value={formData.email} onChange={handleChange} />
              </InfoField>

              <InfoField label="Telefon" isEditing={isEditing}>
                <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
              </InfoField>

              {/* --- DEĞİŞEN KISIMLAR (DROPDOWNS) --- */}

              <InfoField label="Departman" isEditing={isEditing}>
                <Select
                  name="department"
                  options={departments}
                  value={formData.department}
                  onChange={handleChange}
                />
              </InfoField>

              <InfoField label="Unvan" isEditing={isEditing}>
                <Select
                  name="jobTitle"
                  options={jobTitles}
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
              </InfoField>

              <InfoField label="Pozisyon (Yönetici Rolü)" isEditing={isEditing}>
                <Select
                  name="position"
                  options={positions}
                  value={formData.position || ""}
                  onChange={handleChange}
                />
              </InfoField>

              {/* ------------------------------------ */}

              <InfoField label="Giriş Tarihi" isEditing={isEditing}>
                <Input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                />
              </InfoField>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Yardımcı Bileşen: Edit moduna göre Input/Select veya Text gösterir
function InfoField({
  label,
  isEditing,
  children,
}: {
  label: string;
  isEditing: boolean;
  children: React.ReactNode;
}) {
  // Çocuk elemanın value'sunu alıyoruz (Görüntüleme modu için)
  const value = (children as any).props.value;

  return (
    <div className="mb-2">
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      {isEditing ? (
        // Düzenleme modunda Input/Select göster
        children
      ) : (
        // Okuma modunda sadece yazıyı göster
        <p className="text-gray-800 font-medium py-2 border-b border-gray-100 min-h-[40px] flex items-center">
          {value || <span className="text-gray-300 text-sm">-</span>}
        </p>
      )}
    </div>
  );
}
