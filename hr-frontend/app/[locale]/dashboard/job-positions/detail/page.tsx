"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { recruitmentService } from "../../../../../services/recruitmentService";
import { employeeService } from "../../../../../services/employeeService";
import { JobPosition, JobApplication, Candidate, Employee } from "../../../../../types";
import Button from "../../../../../components/ui/Button";
import Select from "../../../../../components/ui/Select";
import Card from "../../../../../components/ui/Card";
import Modal from "../../../../../components/ui/Modal";
import Badge from "../../../../../components/ui/Badge";
import DataTable, { Column } from "../../../../../components/ui/Table";
import Loading from "../../../../../components/ui/Loading";

export default function JobPositionDetailView({ jobId }: { jobId: number }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState<JobPosition | null>(null);
    
    // Aday Ekleme Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [sourceType, setSourceType] = useState<"INTERNAL" | "EXTERNAL">("EXTERNAL");
    const [candidatesList, setCandidatesList] = useState<{value: string, label: string}[]>([]);
    const [employeesList, setEmployeesList] = useState<{value: string, label: string}[]>([]);
    const [selectedPersonId, setSelectedPersonId] = useState("");

    // Statü Güncelleme
    const [applications, setApplications] = useState<JobApplication[]>([]);

    const EXTERNAL_STATUSES = [
        { value: "BASVURU_ALINDI", label: "Başvuru Alındı" },
        { value: "YONETICIYE_ILETILDI", label: "Yöneticiye İletildi" },
        { value: "MULAKAT_PLANLANDI", label: "Mülakat Planlandı" },
        { value: "IK_MULAKATI_YAPILDI", label: "İK Mülakatı Yapıldı" },
        { value: "TEKNIK_MULAKAT_YAPILDI", label: "Teknik Mülakat Yapıldı" },
        { value: "MUSTERIYE_ILETILDI", label: "Müşteriye İletildi" },
        { value: "MUSTERI_MULAKATI_YAPILDI", label: "Müşteri Mülakatı Yapıldı" },
        { value: "ONAYLANDI", label: "✅ Onaylandı" },
        { value: "REDDEDILDI", label: "❌ Reddedildi" }
    ];

    const INTERNAL_STATUSES = [
        { value: "BASVURU_ALINDI", label: "Talep Alındı" },
        { value: "YONETICIYE_ILETILDI", label: "Yöneticiye İletildi" },
        { value: "MUSTERIYE_ILETILDI", label: "Müşteriye İletildi" },
        { value: "MUSTERI_MULAKATI_YAPILDI", label: "Müşteri Mülakatı Yapıldı" },
        { value: "ONAYLANDI", label: "✅ Onaylandı" },
        { value: "REDDEDILDI", label: "❌ Reddedildi" }
    ];

    useEffect(() => { loadData(); }, [jobId]);

    const loadData = async () => {
        try {
            const jobData = await recruitmentService.getJobById(jobId);
            setJob(jobData);
            // İlişkili başvurular genelde jobData içinde gelir (Backend @OneToMany fetch EAGER ise)
            // Veya ayrı bir endpoint ile çekilebilir. Şimdilik jobData.applications varsayıyoruz.
            if(jobData.applications) setApplications(jobData.applications);

            // Dropdown verilerini şimdiden çekelim
            const [cands, emps] = await Promise.all([
                recruitmentService.getAllCandidates(), // Dış Adaylar (Candidate tablosu)
                employeeService.getAll()              // İç Çalışanlar (Employee tablosu)
            ]);

            setCandidatesList(cands.map(c => ({ value: String(c.id), label: `${c.firstName} ${c.lastName} (Dış)` })));
            setEmployeesList(emps.map(e => ({ value: String(e.id), label: `${e.firstName} ${e.lastName} (İç)` })));

        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleAddCandidate = async () => {
        if(!selectedPersonId) return alert("Kişi seçiniz.");
        
        // İsmi listeden bul (UI'da göstermek için)
        let name = "";
        if(sourceType === 'EXTERNAL') name = candidatesList.find(c => c.value === selectedPersonId)?.label || "";
        else name = employeesList.find(e => e.value === selectedPersonId)?.label || "";

        try {
            await recruitmentService.addCandidateToJob(jobId, {
                candidateId: sourceType === 'EXTERNAL' ? Number(selectedPersonId) : undefined,
                employeeId: sourceType === 'INTERNAL' ? Number(selectedPersonId) : undefined,
                source: sourceType,
                candidateName: name // Backend'de snapshot olarak kaydedilebilir veya ID'den bulunabilir
            });
            alert("Aday sürece eklendi.");
            setShowAddModal(false);
            loadData(); // Yenile
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleStatusChange = async (appId: number, newStatus: string) => {
        await recruitmentService.updateApplicationStatus(appId, newStatus);
        loadData();
    };

    const columns: Column<JobApplication>[] = [
        { header: "Aday Adı", accessorKey: "candidateName", className: "font-bold" },
        { header: "Kaynak", cell: (a) => <Badge variant={a.source === 'INTERNAL' ? 'warning' : 'primary'}>{a.source === 'INTERNAL' ? 'İç Aday' : 'Dış Aday'}</Badge> },
        { header: "Başvuru Tarihi", accessorKey: "applicationDate", className: "text-sm text-gray-500" },
        { 
            header: "Süreç Durumu", 
            cell: (app) => {
                const options = app.source === 'INTERNAL' ? INTERNAL_STATUSES : EXTERNAL_STATUSES;
                return (
                    <select 
                        value={app.status} 
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="border rounded p-1 text-sm bg-white cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                );
            }
        }
    ];

    if (loading || !job) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-black mb-2">← Geri</button>
                    <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
                    <p className="text-gray-500">{job.customer} • {job.status}</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>+ Aday Ekle / Süreç Başlat</Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* SOL: DETAYLAR */}
                <div className="col-span-1 space-y-6">
                    <Card className="p-4 bg-blue-50 border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-2">Pozisyon Özellikleri</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{job.requirements}</p>
                    </Card>
                    <Card className="p-4">
                        <h3 className="font-bold text-gray-700 mb-2">Detaylı Açıklama</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{job.description}</p>
                    </Card>
                </div>

                {/* SAĞ: SÜREÇ TABLOSU */}
                <div className="col-span-2">
                    <Card>
                        <h3 className="font-bold text-gray-800 p-4 border-b">Aday Süreçleri</h3>
                        <DataTable data={applications} columns={columns} emptyMessage="Henüz bu pozisyona aday eklenmedi." />
                    </Card>
                </div>
            </div>

            {/* ADAY EKLEME MODALI */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Sürece Aday Ekle" footer={<Button onClick={handleAddCandidate}>Ekle</Button>}>
                <div className="space-y-4">
                    <div className="flex gap-4 border-b pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="source" checked={sourceType === 'EXTERNAL'} onChange={() => setSourceType('EXTERNAL')} />
                            <span>Dış Aday (Havuzdan)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="source" checked={sourceType === 'INTERNAL'} onChange={() => setSourceType('INTERNAL')} />
                            <span>İç Aday (Mevcut Çalışan)</span>
                        </label>
                    </div>

                    <Select 
                        label={sourceType === 'EXTERNAL' ? "Aday Seçin" : "Çalışan Seçin"}
                        options={sourceType === 'EXTERNAL' ? candidatesList : employeesList}
                        value={selectedPersonId}
                        onChange={(e) => setSelectedPersonId(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
}