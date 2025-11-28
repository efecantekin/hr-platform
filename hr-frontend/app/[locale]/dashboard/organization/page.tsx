"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { employeeService } from "../../../../services/employeeService";
import { Employee } from "../../../../types";

export default function OrganizationPage() {
  const router = useRouter();
  const [treeData, setTreeData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchAllEmployees();
  }, [router]);

  const fetchAllEmployees = async () => {
    try {
      // 1. Servisi Çağır (URL ve Header otomatik)
      const flatList = await employeeService.getAll();

      // 2. Ağaç yapısına çevir (Mevcut mantık)
      const tree = buildTree(flatList);
      setTreeData(tree);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  // Düz Listeyi Ağaca Çevirme
  const buildTree = (employees: Employee[]) => {
    const map = new Map<number, Employee>();
    const roots: Employee[] = [];

    // Haritalama
    employees.forEach((emp) => {
      map.set(emp.id, { ...emp, children: [] });
    });

    // İlişkilendirme
    employees.forEach((emp) => {
      const node = map.get(emp.id);
      if (emp.managerId) {
        const parent = map.get(emp.managerId);
        if (parent) {
          parent.children?.push(node!);
        }
      } else {
        roots.push(node!);
      }
    });
    return roots;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Organizasyon Şeması</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Geri
        </button>
      </div>

      {loading ? (
        <p className="text-center">Yükleniyor...</p>
      ) : (
        <div className="bg-white p-8 rounded shadow overflow-auto min-h-[500px]">
          {treeData.length === 0 ? (
            <p className="text-gray-500 text-center">Çalışan kaydı veya hiyerarşi bulunamadı.</p>
          ) : (
            treeData.map((node) => <EmployeeNode key={node.id} node={node} level={0} />)
          )}
        </div>
      )}
    </div>
  );
}

// --- GÜNCELLENMİŞ KART TASARIMI ---
function EmployeeNode({ node, level }: { node: Employee; level: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: level * 24 }} className="mb-3 relative">
      {/* Bağlantı Çizgileri (Görsel Zenginlik) */}
      {level > 0 && <div className="absolute -left-4 top-5 w-4 h-px bg-gray-300"></div>}

      <div className="flex items-center gap-2">
        {/* Aç/Kapa Butonu */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 font-bold text-xs border border-indigo-200 z-10"
          >
            {expanded ? "−" : "+"}
          </button>
        ) : (
          <div className="w-6 h-6 flex-shrink-0"></div> // Hizalama boşluğu
        )}

        {/* Kart */}
        <div
          className={`border p-3 rounded-lg flex items-center gap-4 shadow-sm min-w-[300px] transition-all hover:shadow-md bg-white ${
            hasChildren ? "border-indigo-200" : "border-gray-200"
          }`}
        >
          {/* Avatar (Baş Harfler) */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              node.position ? "bg-indigo-600" : "bg-gray-400"
            }`}
          >
            {node.firstName.charAt(0)}
            {node.lastName.charAt(0)}
          </div>

          {/* Bilgiler */}
          <div>
            <p className="font-bold text-gray-800 text-sm">
              {node.firstName} {node.lastName}
            </p>
            <div className="text-xs">
              {node.position ? (
                // Eğer Pozisyon (Yönetici Rolü) varsa Mavi ve Kalın göster
                <span className="text-indigo-600 font-bold block">{node.position}</span>
              ) : (
                // Yoksa standart gri Unvan göster
                <span className="text-gray-500 block">{node.jobTitle}</span>
              )}
              <span className="text-gray-400">{node.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Çocuklar (Recursive) */}
      {expanded && hasChildren && (
        <div className="border-l-2 border-gray-200 ml-3 pt-2 pl-2">
          {node.children!.map((child) => (
            <EmployeeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
