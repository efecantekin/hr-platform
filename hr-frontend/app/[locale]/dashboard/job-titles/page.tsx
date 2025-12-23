"use client";

import { useEffect, useState } from "react";
import { jobTitleService } from "../../../../services/jobTitleService";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Card from "../../../../components/ui/Card";
import Modal from "../../../../components/ui/Modal";
import DataTable, { Column } from "../../../../components/ui/Table";
import { JobTitle } from "../../../../types";
import Select from "../../../../components/ui/Select"; // Select eklendi
import Badge from "../../../../components/ui/Badge"; // Badge eklendi
import { departmentService } from "../../../../services/departmentService";
import Loading from "../../../../components/ui/Loading";

export default function JobTitlesView() {
  const [list, setList] = useState<JobTitle[]>([]);
  // Select bileşeni için uygun format
  const [departments, setDepartments] = useState<{value: string | number, label: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [titlesData, deptsData] = await Promise.all([
          jobTitleService.getAll(),
          departmentService.getAll()
      ]);

      setList(titlesData);
      
      // Departmanları Select bileşeni formatına ({value, label}) dönüştür
      setDepartments(deptsData.map(d => ({ 
          value: d.id, 
          label: d.name 
      })));

    } catch (err) {
      console.error("Veri hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return alert("Lütfen bir unvan giriniz.");
    if (!selectedDepartment) return alert("Lütfen bir departman seçiniz.");
    
    try {
      await jobTitleService.create({
          title: title,
          departmentId: Number(selectedDepartment)
      });
      
      setShowModal(false); 
      setTitle("");       
      setSelectedDepartment(""); 
      loadData();         
      alert("Unvan başarıyla eklendi!");
    } catch (err) {
      alert("Ekleme işlemi başarısız!");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu unvanı silmek istediğinize emin misiniz?")) return;
    
    try {
      await jobTitleService.delete(id);
      loadData();
    } catch (err) {
      alert("Hata: Bu unvan şu an bir çalışan tarafından kullanılıyor olabilir.");
    }
  };

  // Client-Side Arama
  const filteredList = list.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Tablo Kolon Tanımları
  const columns: Column<JobTitle>[] = [
    {
      header: "Unvan Adı",
      accessorKey: "title",
      className: "font-medium text-gray-900"
    },
    {
        header: "Bağlı Olduğu Departman",
        cell: (item) => item.department ? (
            <Badge variant="neutral">{item.department.name}</Badge>
        ) : (
            <span className="text-gray-400 text-xs">-</span>
        )
    },
    {
      header: "İşlem",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => handleDelete(item.id)}
          >
            Sil
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* BAŞLIK VE BUTON */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Unvan (Job Title) Yönetimi</h1>
        <Button onClick={() => setShowModal(true)}>+ Yeni Unvan</Button>
      </div>

      {/* ARAMA ALANI */}
      <div className="mb-4 max-w-md mx-auto">
        <Input 
            placeholder="🔍 Unvan ara..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      {/* TABLO */}
      <div className="max-w-4xl mx-auto">
        <Card>
            <DataTable 
                data={filteredList} 
                columns={columns} 
                emptyMessage="Kayıtlı unvan bulunamadı." 
            />
        </Card>
      </div>

      {/* EKLEME MODALI */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Yeni Unvan Ekle" 
        footer={
            <>
                <Button variant="secondary" onClick={() => setShowModal(false)}>İptal</Button>
                <Button onClick={handleSubmit}>Kaydet</Button>
            </>
        }
      >
        <div className="space-y-4">
            <Input 
                label="Unvan Adı" 
                placeholder="Örn: Senior Developer" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
            />
            
            <Select 
                label="Bağlı Olduğu Departman"
                options={departments}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
            />
        </div>
      </Modal>
    </div>
  );
}