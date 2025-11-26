"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Servisler
import { employeeService } from "../../../services/employeeService";
import { departmentService, Department } from "../../../services/departmentService";
import { jobTitleService, JobTitle } from "../../../services/jobTitleService";
import { Employee } from "../../../types";

export default function EmployeesPage() {
  const router = useRouter();
  
  // --- STATE TANIMLARI ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Dropdown Verileri
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form Verisi
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "", // Dropdown'dan gelecek
    jobTitle: "",   // Dropdown'dan gelecek
    position: "",   // Hiyerarşi rolü (Opsiyonel veya manuel)
    phoneNumber: "",
    hireDate: new Date().toISOString().split('T')[0]
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
        jobTitleService.getAll()
      ]);

      setEmployees(empData);
      setDepartments(deptData);
      setJobTitles(titleData);

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
        firstName: "", lastName: "", email: "", 
        department: "", jobTitle: "", position: "",
        phoneNumber: "", hireDate: new Date().toISOString().split('T')[0]
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* BAŞLIK */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personel Yönetimi</h1>
        <div className="space-x-4">
             <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-gray-900">← Geri</button>
             <button 
                onClick={() => setShowModal(true)} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
             >
                + Yeni Çalışan Ekle
             </button>
        </div>
      </div>

      {/* TABLO */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="px-5 py-3">Ad Soyad</th>
              <th className="px-5 py-3">Departman</th>
              <th className="px-5 py-3">Unvan</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Giriş Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={5} className="p-5 text-center">Yükleniyor...</td></tr>
            ) : employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                <td className="px-5 py-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {emp.department}
                    </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{emp.jobTitle}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{emp.email}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{emp.hireDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && employees.length === 0 && <div className="p-4 text-center text-gray-500">Kayıtlı çalışan yok.</div>}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-[600px]">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Yeni Çalışan Kartı</h2>
            
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              
              {/* Ad */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Ad</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Soyad */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Soyad</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Email */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Email (Kullanıcı Adı Olacak)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* --- GÜNCELLENEN KISIM: DROPDOWNLAR --- */}
              
              {/* Departman Seçimi */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Departman</label>
                <select 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    className="w-full border p-2 rounded text-sm text-black bg-white"
                    required
                >
                    <option value="">-- Seçiniz --</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                </select>
                {departments.length === 0 && <span className="text-xs text-red-500">Önce Departman tanımlayın!</span>}
              </div>

              {/* Unvan Seçimi */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Unvan</label>
                <select 
                    name="jobTitle" 
                    value={formData.jobTitle} 
                    onChange={handleChange} 
                    className="w-full border p-2 rounded text-sm text-black bg-white"
                    required
                >
                    <option value="">-- Seçiniz --</option>
                    {jobTitles.map(t => (
                        <option key={t.id} value={t.title}>{t.title}</option>
                    ))}
                </select>
                {jobTitles.length === 0 && <span className="text-xs text-red-500">Önce Unvan tanımlayın!</span>}
              </div>

              {/* Pozisyon (Manuel Giriş - veya istersen burayı da PositionService'e bağlayabiliriz) */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Pozisyon (Yönetici Rolü)</label>
                <input name="position" value={formData.position} onChange={handleChange} placeholder="Örn: Takım Lideri" className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Telefon */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Telefon</label>
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Giriş Tarihi */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">İşe Giriş Tarihi</label>
                <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} className="w-full border p-2 rounded text-sm text-black" />
              </div>

              {/* Butonlar */}
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">İptal</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Kaydet</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}