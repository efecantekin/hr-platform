"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Servisler
import { employeeService } from "../../../../services/employeeService";
import { departmentService } from "../../../../services/departmentService";
import { jobTitleService } from "../../../../services/jobTitleService";
import { Employee } from "../../../../types";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Modal from "../../../../components/ui/Modal";
import Badge from "../../../../components/ui/Badge";
import DataTable, { Column } from "../../../../components/ui/Table";
import Loading from "../../../../components/ui/Loading";
import Card from "../../../../components/ui/Card";

export default function EmployeesPage() {
  const router = useRouter();

  // --- STATE TANIMLARI ---
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Dropdown Verileri
  const [departments, setDepartments] = useState<{ value: string | number; label: string }[]>([]);
  const [jobTitles, setJobTitles] = useState<{ value: string | number; label: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form Verisi
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "", // Dropdown'dan gelecek
    jobTitle: "", // Dropdown'dan gelecek
    position: "", // Hiyerarşi rolü (Opsiyonel veya manuel)
    phoneNumber: "",
    hireDate: new Date().toISOString().split("T")[0],
  });

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Sadece Admin ve Manager girebilsin
    if (!token || (role !== "ADMIN" && role !== "MANAGER")) {
      alert("Yetkisiz erişim!");
      router.push("/dashboard");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Paralel olarak tüm verileri çekelim
      const [empData, deptData, titleData] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll(),
        jobTitleService.getAll(),
      ]);

      setEmployees(empData);
      setDepartments(
        deptData.map((d) => ({
          value: d.name, // Backend'e isim gönderdiğimiz için value = name
          label: d.name, // Kullanıcının gördüğü yazı
        }))
      );

      setJobTitles(
        titleData.map((t) => ({
          value: t.title,
          label: t.title,
        }))
      );
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- KAYIT İŞLEMİ ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basit Validasyon
    if (!formData.department || !formData.jobTitle) {
      alert("Lütfen Departman ve Unvan seçiniz.");
      return;
    }

    try {
      await employeeService.create(formData);

      alert("Personel başarıyla eklendi!");
      setShowModal(false);

      // Formu temizle
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        jobTitle: "",
        position: "",
        phoneNumber: "",
        hireDate: new Date().toISOString().split("T")[0],
      });

      // Listeyi yenile
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error(error);
      alert("Ekleme işlemi başarısız!");
    }
  };

  // Input Değişikliklerini Yakala
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns: Column<Employee>[] = [
    {
      header: "Ad Soyad",
      // Özel render: İki alanı birleştiriyoruz
      cell: (emp) => (
        <span className="font-medium text-gray-900">
          {emp.firstName} {emp.lastName}
        </span>
      ),
    },
    {
      header: "Departman",
      // Özel render: Badge kullanıyoruz
      cell: (emp) => <Badge variant="primary">{emp.department}</Badge>,
    },
    {
      header: "Unvan",
      accessorKey: "jobTitle", // Direkt metin basıyoruz
      className: "text-gray-600",
    },
    {
      header: "Email",
      accessorKey: "email",
      className: "text-gray-500",
    },
    {
      header: "",
      className: "text-right",
      cell: (emp) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/dashboard/employees/${emp.id}`)}
        >
          Detay &rArr;
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personel Yönetimi</h1>
        <Button onClick={() => setShowModal(true)}>+ Yeni Çalışan</Button>
      </div>
      <Card>
        {loading ? (
          <Loading />
        ) : (
          <DataTable data={employees} columns={columns} emptyMessage="Henüz kayıtlı çalışan yok." />
        )}
      </Card>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yeni Çalışan Kartı"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              İptal
            </Button>
            <Button onClick={handleCreate}>Kaydet</Button>
          </>
        }
      >
        <form className="grid grid-cols-2 gap-4">
          <Input name="firstName" label="Ad" value={formData.firstName} onChange={handleChange} />
          <Input name="lastName" label="Soyad" value={formData.lastName} onChange={handleChange} />
          <Input
            name="email"
            label="Email"
            className="col-span-2"
            value={formData.email}
            onChange={handleChange}
          />
          <Select
            name="department"
            label="Departman"
            options={departments}
            value={formData.department}
            onChange={handleChange}
          />
          <Select
            name="jobTitle"
            label="Unvan"
            options={jobTitles}
            value={formData.jobTitle}
            onChange={handleChange}
          />
          <Input
            name="position"
            label="Pozisyon (Rol)"
            value={formData.position}
            onChange={handleChange}
          />
          <Input
            name="phoneNumber"
            label="Telefon"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <Input
            name="hireDate"
            type="date"
            label="Giriş Tarihi"
            className="col-span-2"
            value={formData.hireDate}
            onChange={handleChange}
          />
        </form>
      </Modal>
    </div>
  );
}
