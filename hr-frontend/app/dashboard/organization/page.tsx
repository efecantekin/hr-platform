"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Çalışan Tipi
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  managerId: number | null;
  children?: Employee[]; // Ağaç yapısı için biz ekleyeceğiz
}

export default function OrganizationPage() {
  const router = useRouter();
  const [treeData, setTreeData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    fetchAllEmployees(token);
  }, [router]);

  const fetchAllEmployees = async (token: string) => {
    try {
      // 1. Tüm çalışanları düz liste olarak çek
      const response = await axios.get("http://localhost:8080/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const flatList: Employee[] = response.data;
      
      // 2. Düz listeyi Ağaç Yapısına (Tree) dönüştür
      const tree = buildTree(flatList);
      setTreeData(tree);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- FLAT LIST TO TREE CONVERTER ---
  // Bu fonksiyon düz veritabanı verisini hiyerarşik yapıya çevirir
  const buildTree = (employees: Employee[]) => {
    const map = new Map<number, Employee>();
    const roots: Employee[] = [];

    // Önce herkesi bir haritaya koy ve children dizisi ekle
    employees.forEach(emp => {
      map.set(emp.id, { ...emp, children: [] });
    });

    // Sonra ilişkileri kur
    employees.forEach(emp => {
      const node = map.get(emp.id);
      if (emp.managerId) {
        // Yöneticisi varsa, yöneticisinin çocuklarına ekle
        const parent = map.get(emp.managerId);
        if (parent) {
          parent.children?.push(node!);
        }
      } else {
        // Yöneticisi yoksa bu bir kök (Root) düğümdür (Örn: CEO)
        roots.push(node!);
      }
    });
    return roots;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Organizasyon Şeması</h1>
        <button onClick={() => router.push("/dashboard")} className="text-gray-600">← Geri</button>
      </div>

      {loading ? <p>Yükleniyor...</p> : (
        <div className="bg-white p-8 rounded shadow overflow-auto">
          {treeData.length === 0 ? (
            <p className="text-gray-500">Çalışan kaydı bulunamadı.</p>
          ) : (
            // Ağacı çizmeye başla
            treeData.map(node => <EmployeeNode key={node.id} node={node} level={0} />)
          )}
        </div>
      )}
    </div>
  );
}

// --- RECURSIVE COMPONENT (Kendini Çağıran Bileşen) ---
function EmployeeNode({ node, level }: { node: Employee; level: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: level * 20 }} className="mb-2">
      <div className="flex items-center gap-2">
        {/* Ok işareti (Varsa) */}
        {hasChildren ? (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs hover:bg-gray-300"
          >
            {expanded ? "▼" : "▶"}
          </button>
        ) : (
          <div className="w-6 h-6"></div> // Boşluk
        )}

        {/* Kart Tasarımı */}
        <div className="border p-3 rounded bg-blue-50 flex items-center gap-4 shadow-sm w-96 hover:shadow-md transition">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {node.firstName.charAt(0)}{node.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-800">{node.firstName} {node.lastName}</p>
            <p className="text-xs text-gray-500">{node.jobTitle} • {node.department}</p>
          </div>
        </div>
      </div>

      {/* Altındakiler (Recursive Çağrı) */}
      {expanded && hasChildren && (
        <div className="border-l-2 border-gray-200 ml-3 mt-2 pl-4">
           {node.children!.map(child => (
             <EmployeeNode key={child.id} node={child} level={level + 1} />
           ))}
        </div>
      )}
    </div>
  );
}