"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Servisler
import { recruitmentService } from "../../../../services/recruitmentService";
import { employeeService } from "../../../../services/employeeService";
import { departmentService } from "../../../../services/departmentService"; // Eklendi
import { jobTitleService } from "../../../../services/jobTitleService";   // Eklendi
import { JobPosition, JobTitle } from "../../../../types";

// UI Bileşenleri
import Button from "../../../../components/ui/Button";
import Select from "../../../../components/ui/Select"; // Input yerine Select ağırlıklı
import Modal from "../../../../components/ui/Modal";
import Card from "../../../../components/ui/Card";
import DataTable, { Column } from "../../../../components/ui/Table";
import Badge from "../../../../components/ui/Badge";
import Loading from "../../../../components/ui/Loading";
import MultiSelect from "../../../../components/ui/MultiSelect"; // MultiSelect Eklendi

export default function JobPositionsView() {
    const router = useRouter();
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Dropdown Verileri
    const [hrEmployees, setHrEmployees] = useState<{value: string, label: string}[]>([]);
    const [managers, setManagers] = useState<{value: string, label: string}[]>([]);
    const [departments, setDepartments] = useState<{value: string, label: string}[]>([]);
    
    // YENİ: Tüm unvanları ham haliyle tutuyoruz ki filtreleyebilelim
    const [allJobTitles, setAllJobTitles] = useState<JobTitle[]>([]);

    const [formData, setFormData] = useState<Partial<JobPosition> & { department?: string }>({
        title: "", 
        customer: "", 
        requirements: "", 
        description: "", 
        assignedHrId: 0, 
        hiringManagerId: 0,
        department: "" 
    });

    // Sabit Listeler
    const CUSTOMERS = [
        { value: "X Bankası", label: "X Bankası" },
        { value: "Y Teknoloji", label: "Y Teknoloji" },
        { value: "Z Holding", label: "Z Holding" }
    ];
    
    const TECH_STACK = [
        "Java", "Spring Boot", "React", "Next.js", "Angular", "Vue", 
        "Node.js", "Docker", "Kubernetes", "AWS", "Python", "Go", 
        "PostgreSQL", "MongoDB", "Redis", "C#", ".NET Core", "TypeScript"
    ];

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [jobsData, employees, deptData, titleData] = await Promise.all([
                recruitmentService.getAllJobs(),
                employeeService.getAll(),
                departmentService.getAll(),
                jobTitleService.getAll()
            ]);
            
            setJobs(jobsData);
            setDepartments(deptData.map(d => ({ value: d.name, label: d.name })));
            
            // YENİ: Unvanları ham haliyle sakla (içinde department objesi var)
            setAllJobTitles(titleData);

            setHrEmployees(employees
                .filter(e => e.department === 'HR' || e.department === 'İnsan Kaynakları')
                .map(e => ({ value: String(e.id), label: `${e.firstName} ${e.lastName}` }))
            );

            setManagers(employees
                .filter(e => e.position && e.position.trim() !== "")
                .map(e => ({ value: String(e.id), label: `${e.firstName} ${e.lastName} (${e.position})` }))
            );

        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // --- CASCADING DROPDOWN MANTIĞI ---
    // Seçilen departmana göre unvanları anlık filtrele
    const availableJobTitles = allJobTitles
        .filter(t => t.department?.name === formData.department) // Sadece seçili departmana ait olanlar
        .map(t => ({ value: t.title, label: t.title })); // Select formatına çevir

    const handleCreate = async () => {
        if (!formData.customer || !formData.title || !formData.department || !formData.requirements || !formData.assignedHrId || !formData.hiringManagerId) {
            return alert("Lütfen tüm zorunlu alanları doldurunuz.");
        }
        
        try {
            await recruitmentService.createJob({
                ...formData,
                assignedHrId: Number(formData.assignedHrId),
                hiringManagerId: Number(formData.hiringManagerId)
            });
            alert("Pozisyon başarıyla açıldı!");
            setShowModal(false);
            // Formu sıfırla
            setFormData({
                title: "", customer: "", requirements: "", description: "", assignedHrId: 0, hiringManagerId: 0, department: ""
            });
            loadData();
        } catch (error) {
            alert("Kayıt sırasında bir hata oluştu.");
        }
    };

    const columns: Column<JobPosition>[] = [
        { header: "Pozisyon", accessorKey: "title", className: "font-bold" },
        { header: "Müşteri", accessorKey: "customer" },
        { header: "Teknolojiler", cell: (j) => (
            <div className="flex flex-wrap gap-1">
                {j.requirements?.split(',').slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded border">{t}</span>
                ))}
                {j.requirements?.split(',').length > 3 && <span className="text-[10px] text-gray-400">...+</span>}
            </div>
        )},
        { header: "Durum", cell: (j) => <Badge variant={j.status === 'OPEN' ? 'success' : 'neutral'}>{j.status}</Badge> },
        { header: "İşlem", className: "text-right", cell: (j) => (
            <div className="flex justify-end">
                <Button size="sm" onClick={() => router.push(`/dashboard/recruitment/jobs/${j.id}`)}>Süreç Yönetimi &rArr;</Button>
            </div>
        )}
    ];

    if(loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Açık Pozisyonlar</h1>
                <Button onClick={() => setShowModal(true)}>+ Yeni Pozisyon Aç</Button>
            </div>

            <Card><DataTable data={jobs} columns={columns} emptyMessage="Açık pozisyon yok." /></Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Yeni Pozisyon Aç" footer={<Button onClick={handleCreate}>Kaydet</Button>}>
                <div className="grid grid-cols-2 gap-4">
                    <Select 
                        label="Müşteri" 
                        options={CUSTOMERS} 
                        value={formData.customer} 
                        onChange={e=>setFormData({...formData, customer: e.target.value})} 
                    />

                    {/* 1. DEPARTMAN SEÇİMİ */}
                    <Select 
                        label="Departman" 
                        options={departments} 
                        value={formData.department} 
                        onChange={e => {
                            // Departman değişince unvanı sıfırla ki tutarsızlık olmasın
                            setFormData({ ...formData, department: e.target.value, title: "" });
                        }} 
                    />

                    {/* 2. UNVAN SEÇİMİ (Filtreli) */}
                    <Select 
                        label="Pozisyon Unvanı" 
                        options={availableJobTitles} // Filtrelenmiş liste
                        value={formData.title} 
                        onChange={e=>setFormData({...formData, title: e.target.value})} 
                        disabled={!formData.department} // Departman seçilmezse kilitli
                    />
                    {availableJobTitles.length === 0 && formData.department && (
                        <p className="col-span-1 text-xs text-red-500 -mt-3">Bu departmanda tanımlı unvan yok.</p>
                    )}
                    
                    <div className="col-span-2">
                        <MultiSelect 
                            label="Gerekli Teknolojiler"
                            placeholder="Java, React, Docker..."
                            options={TECH_STACK}
                            value={formData.requirements || ""}
                            onChange={(val) => setFormData(prev => ({ ...prev, requirements: val }))}
                        />
                    </div>

                    <Select 
                        label="Atanan İK Sorumlusu" 
                        options={hrEmployees} 
                        value={String(formData.assignedHrId)} 
                        onChange={e=>setFormData({...formData, assignedHrId: Number(e.target.value)})} 
                    />
                    
                    <Select 
                        label="İşe Alım Yöneticisi" 
                        options={managers} 
                        value={String(formData.hiringManagerId)} 
                        onChange={e=>setFormData({...formData, hiringManagerId: Number(e.target.value)})} 
                    />
                    
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Detaylı Açıklama</label>
                        <textarea 
                            className="w-full border p-2 rounded h-24 text-sm text-black focus:outline-none focus:border-blue-500" 
                            value={formData.description} 
                            onChange={e=>setFormData({...formData, description: e.target.value})} 
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}