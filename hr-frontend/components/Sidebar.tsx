"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuService } from "../services/menuService";
import { MenuItem } from "../types";

export default function Sidebar() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [userRole, setUserRole] = useState("");

  // --- FİLTRELEME MOTORU ---
  const filterMenuByRole = (items: MenuItem[], role: string): MenuItem[] => {
    return items
      .filter((item) => {
        // KURAL 1: Menüde rol kısıtlaması varsa kontrol et
        if (item.roles && item.roles.length > 0) {
          // Kullanıcının rolü, menünün izin verilen rolleri arasında YOKSA -> GİZLE
          if (!item.roles.includes(role)) {
            return false;
          }
        }
        // Rol listesi boşsa veya null ise -> HERKES GÖRÜR
        return true;
      })
      .map((item) => {
        // KURAL 2: Alt menüleri de (Children) aynı süzgeçten geçir (Recursive)
        if (item.children && item.children.length > 0) {
          return { ...item, children: filterMenuByRole(item.children, role) };
        }
        return item;
      })
      .filter((item) => {
        // KURAL 3: Temizlik (Çocuğu Kalmayan Başlıkları Gizle)
        // Eğer bir item'ın URL'si yoksa (yani sadece bir klasör başlığıysa)
        // VE filtreleme sonrası hiç çocuğu kalmadıysa -> Onu da GİZLE.
        if (!item.url && (!item.children || item.children.length === 0)) {
          return false;
        }
        return true;
      });
  };

  useEffect(() => {
    // 1. Kullanıcının Rolünü Al
    const role = localStorage.getItem("role") || "USER";
    setUserRole(role);

    // 2. Menüyü Çek ve Filtrele
    menuService
      .getTree()
      .then((data) => {
        // Ham veriyi al, role göre süz ve öyle state'e at
        const filteredData = filterMenuByRole(data, role);
        setMenuItems(filteredData);
      })
      .catch(console.error);
  }, []);

  return (
    <nav className="space-y-1 flex flex-col h-full">
      <div className="flex-1">
        {menuItems.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </div>

      {/* Yönetim Linki (Sadece ADMIN) */}
      {userRole === "ADMIN" && (
        <div className="mt-auto border-t border-gray-200 pt-4 pb-4">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Yönetim
          </p>
          <Link
            href="/dashboard/menu-management"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 group"
          >
            <span className="mr-3">⚙️</span>
            Menü Yönetimi
          </Link>
        </div>
      )}
    </nav>
  );
}

// --- SIDEBAR ITEM BİLEŞENİ (Görünüm) ---
function SidebarItem({ item }: { item: MenuItem }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Çocuğu var mı kontrolü (Filtrelemeden sonra boş kalmış olabilir)
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.url && pathname === item.url;

  // 1. Durum: Alt Menüsü Var (Klasör)
  if (hasChildren) {
    return (
      <div className="ml-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 rounded hover:bg-gray-100 transition-colors"
        >
          <span className="truncate">{item.title}</span>
          <span className="text-xs text-gray-400 ml-2">{isOpen ? "▼" : "▶"}</span>
        </button>
        {isOpen && (
          <div className="pl-3 border-l border-gray-200 ml-3 mt-1 space-y-1 transition-all">
            {item.children!.map((child) => (
              <SidebarItem key={child.id} item={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Durum: Tek Link
  return (
    <Link
      href={item.url || "#"}
      className={`block px-4 py-2 text-sm font-medium rounded ml-2 transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {item.title}
    </Link>
  );
}
