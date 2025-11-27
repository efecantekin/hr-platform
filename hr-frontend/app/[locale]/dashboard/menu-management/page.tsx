"use client";

import { useEffect, useState } from "react";
import { menuService } from "../../../../services/menuService";
import { screenService } from "../../../../services/screenService";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuItem, SystemScreen } from "../../../../types";

// --- 1. SORTABLE ITEM (Sıralanabilir Satır) ---
function SortableItem({
  item,
  onEdit,
  onDelete,
  children,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  children?: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      {/* Menü Satırı */}
      <div className="bg-white p-3 border rounded shadow-sm flex justify-between items-center hover:bg-gray-50 transition">
        <div className="flex items-center gap-2 cursor-move flex-1" {...attributes} {...listeners}>
          <span className="text-gray-400 text-lg">::</span> {/* Tutma sapı */}
          <div>
            <span className="font-bold text-gray-800">{item.title}</span>
            {item.url && (
              <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                {item.url}
              </span>
            )}

            {/* Roller */}
            {item.roles && item.roles.length > 0 && (
              <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-1 rounded border border-yellow-200">
                {item.roles.join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(item)}
            className="text-blue-500 text-xs font-bold px-1 bg-blue-50 rounded hover:bg-blue-100"
          >
            Düzenle
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(item.id)}
            className="text-red-500 text-xs font-bold px-1 bg-red-50 rounded hover:bg-red-100"
          >
            Sil
          </button>
        </div>
      </div>

      {/* Alt Menüler (Varsa Buraya Render Edilir) */}
      <div className="pl-8 mt-1 border-l-2 border-gray-100">{children}</div>
    </div>
  );
}

// --- 2. RECURSIVE LIST (İç İçe Sıralanabilir Liste) ---
// Bu bileşen hem kök listeyi hem de alt listeleri render eder.
function MenuList({ items, onEdit, onDelete }: { items: MenuItem[]; onEdit: any; onDelete: any }) {
  return (
    <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
      {items.map((item) => (
        <SortableItem key={item.id} item={item} onEdit={onEdit} onDelete={onDelete}>
          {/* Eğer alt menü varsa, kendini tekrar çağırır (Recursion) */}
          {item.children && item.children.length > 0 && (
            <MenuList items={item.children} onEdit={onEdit} onDelete={onDelete} />
          )}
        </SortableItem>
      ))}
    </SortableContext>
  );
}

// --- 3. ANA SAYFA BİLEŞENİ ---
export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [availableScreens, setAvailableScreens] = useState<SystemScreen[]>([]);

  // Modallar
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showScreenModal, setShowScreenModal] = useState(false);

  // Formlar
  const [menuForm, setMenuForm] = useState({
    title: "",
    url: "",
    parentId: "",
    roles: [] as string[],
  });
  const [screenForm, setScreenForm] = useState({ name: "", url: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const AVAILABLE_ROLES = ["ADMIN", "MANAGER", "USER"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tree, screens] = await Promise.all([menuService.getTree(), screenService.getAll()]);
      setMenuItems(tree);
      setAvailableScreens(screens);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  // --- DRAG & DROP MANTIĞI (GELİŞMİŞ) ---

  // Ağaçta belirli bir ID'nin bulunduğu diziyi (container) bulur
  const findContainer = (id: number, items: MenuItem[]): MenuItem[] | undefined => {
    // 1. Kök dizide mi?
    if (items.find((i) => i.id === id)) return items;

    // 2. Çocuklarda ara
    for (const item of items) {
      if (item.children) {
        const found = findContainer(id, item.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    // Aynı yere bırakıldıysa işlem yapma
    if (!over || active.id === over.id) return;

    // Derin kopyalama (State mutasyonu yapmamak için)
    const newTree = JSON.parse(JSON.stringify(menuItems));

    // Hangi dizinin içinde işlem yapıldığını bul
    const activeContainer = findContainer(active.id, newTree);
    const overContainer = findContainer(over.id, newTree);

    // Sadece aynı seviyede sıralamaya izin veriyoruz (Karmaşıklığı önlemek için)
    if (activeContainer && overContainer && activeContainer === overContainer) {
      const oldIndex = activeContainer.findIndex((i: MenuItem) => i.id === active.id);
      const newIndex = activeContainer.findIndex((i: MenuItem) => i.id === over.id);

      // Yer değiştir
      const reorderedList = arrayMove(activeContainer, oldIndex, newIndex);

      // Orijinal ağaçtaki diziyi güncellememiz lazım.
      // Javascript referans ile çalıştığı için 'activeContainer' zaten 'newTree'nin bir parçasıdır.
      // Ancak arrayMove yeni bir dizi döner, bu yüzden referansı güncellemeliyiz.
      // Bu kısım biraz trikili olduğu için en garantisi:
      // Container'ı bulup içeriğini değiştirmek yerine, splice ile yerinde değiştiriyoruz.

      const itemToMove = activeContainer[oldIndex];
      activeContainer.splice(oldIndex, 1);
      activeContainer.splice(newIndex, 0, itemToMove);

      setMenuItems(newTree); // UI Güncelle

      // Backend için sıralama verisi
      const orderPayload = activeContainer.map((item: MenuItem, index: number) => ({
        id: item.id,
        sortOrder: index + 1,
      }));

      // Kaydet
      menuService.updateOrder(orderPayload).catch((err) => {
        console.error("Sıralama hatası", err);
        alert("Sıralama kaydedilemedi!");
        fetchData(); // Hata varsa geri al
      });
    }
  };

  // --- FORM İŞLEMLERİ ---

  // 1. DÜZENLEME MODUNU AÇ (FIX: Checkbox'lar Dolu Geliyor Artık)
  const openEditModal = (item: MenuItem) => {
    setEditingId(item.id);
    setMenuForm({
      title: item.title,
      url: item.url || "",
      parentId: item.parentId ? item.parentId.toString() : "",
      // FIX: Roles null gelebilir, boş diziye çevir ve kopyala
      roles: item.roles ? [...item.roles] : [],
    });
    setShowMenuModal(true);
  };

  const closeMenuModal = () => {
    setShowMenuModal(false);
    setEditingId(null);
    setMenuForm({ title: "", url: "", parentId: "", roles: [] });
  };

  const getAllUsedUrls = (nodes: MenuItem[]): string[] => {
    let urls: string[] = [];
    nodes.forEach((node) => {
      if (node.url) urls.push(node.url);
      if (node.children && node.children.length > 0) {
        urls = [...urls, ...getAllUsedUrls(node.children)];
      }
    });
    return urls;
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    // Yeni eklendiğinde listenin sonuna atıyoruz
    // Not: Kök menüye ekliyorsak kök sayısı, alta ekliyorsak oranın sayısı...
    // Basitlik için varsayılan 99 verdik, sürükleyince düzelir.
    const payload = {
      title: menuForm.title,
      url: menuForm.url,
      sortOrder: 99,
      parentId: menuForm.parentId ? Number(menuForm.parentId) : null,
      roles: menuForm.roles,
    };

    try {
      if (editingId) {
        await menuService.update(editingId, payload);
        alert("Menü güncellendi!");
      } else {
        await menuService.create(payload);
        alert("Menü oluşturuldu!");
      }
      closeMenuModal();
      fetchData();
    } catch (error) {
      alert("İşlem başarısız oldu.");
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    await menuService.delete(id);
    fetchData();
  };

  const handleRoleChange = (role: string) => {
    setMenuForm((prev) => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles: newRoles };
    });
  };

  // Ekran İşlemleri
  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    await screenService.create(screenForm);
    setShowScreenModal(false);
    setScreenForm({ name: "", url: "" });
    const screens = await screenService.getAll();
    setAvailableScreens(screens);
  };
  const handleDeleteScreen = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Silinsin mi?")) return;
    await screenService.delete(id);
    const screens = await screenService.getAll();
    setAvailableScreens(screens);
  };

  // Helper: Ağacı düzleştir (Parent seçimi için)
  const getAllPotentialParents = (nodes: MenuItem[], list: MenuItem[] = []): MenuItem[] => {
    nodes.forEach((node) => {
      list.push(node);
      if (node.children) getAllPotentialParents(node.children, list);
    });
    return list;
  };
  const allParents = getAllPotentialParents(menuItems);

  const usedUrls = getAllUsedUrls(menuItems);
  const filteredScreens = availableScreens.filter((screen) => !usedUrls.includes(screen.url));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menü Yönetimi</h1>
        <button
          onClick={() => setShowMenuModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          + Yeni Menü Ekle
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* SOL: Ekran Listesi */}
        <div className="col-span-1 bg-white p-4 rounded shadow h-fit border border-gray-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-gray-700">Hazır Ekranlar</h3>
            <button
              onClick={() => setShowScreenModal(true)}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold"
            >
              + Tanımla
            </button>
          </div>
          {filteredScreens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-green-600 font-bold">Harika! 🎉</p>
              <p className="text-xs text-gray-400 mt-1">Tüm ekranlar menüye eklenmiş.</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredScreens.map((screen) => (
                <li
                  key={screen.id}
                  className="text-sm p-3 bg-gray-50 border rounded flex justify-between items-center group cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    setEditingId(null);
                    setMenuForm({ title: screen.name, url: screen.url, parentId: "", roles: [] });
                    setShowMenuModal(true);
                  }}
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-gray-700">{screen.name}</span>
                    <span className="text-[10px] text-gray-400 truncate">{screen.url}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteScreen(screen.id, e)}
                    className="text-gray-300 hover:text-red-500 px-2"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SAĞ: Menü Ağacı (RECURSIVE DND) */}
        <div className="col-span-2">
          <h3 className="font-bold text-gray-700 mb-3">Mevcut Menü Ağacı</h3>
          {/* DndContext ile tüm ağacı sarmalıyoruz */}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <MenuList items={menuItems} onEdit={openEditModal} onDelete={handleDeleteMenu} />
          </DndContext>
        </div>
      </div>

      {/* --- MODAL 1: MENÜ --- */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="font-bold mb-4 text-lg">
              {editingId ? "Menüyü Düzenle" : "Yeni Menü Ekle"}
            </h3>
            <form onSubmit={handleSaveMenu}>
              <div className="mb-3">
                <label className="block text-xs font-bold mb-1">Başlık</label>
                <input
                  className="w-full border p-2 rounded text-black"
                  value={menuForm.title}
                  onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-bold mb-1">URL</label>
                <input
                  className="w-full border p-2 rounded text-black"
                  value={menuForm.url}
                  onChange={(e) => setMenuForm({ ...menuForm, url: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-bold mb-1">Üst Menü</label>
                <select
                  className="w-full border p-2 rounded text-black"
                  value={menuForm.parentId}
                  onChange={(e) => setMenuForm({ ...menuForm, parentId: e.target.value })}
                >
                  <option value="">-- Kök --</option>
                  {allParents
                    .filter((p) => p.id !== editingId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4 bg-gray-50 p-3 rounded border">
                <label className="block text-xs font-bold mb-2">Roller</label>
                <div className="flex gap-2 flex-wrap">
                  {AVAILABLE_ROLES.map((role) => (
                    <label key={role} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={menuForm.roles.includes(role)}
                        onChange={() => handleRoleChange(role)}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span className="text-xs">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeMenuModal}
                  className="bg-gray-200 px-4 py-2 rounded text-black"
                >
                  İptal
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingId ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EKRAN --- */}
      {showScreenModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-96 border-t-4 border-green-500">
            <h3 className="font-bold mb-1 text-lg">Yeni Ekran</h3>
            <form onSubmit={handleCreateScreen}>
              <div className="mb-3">
                <label className="block text-xs font-bold mb-1">Ad</label>
                <input
                  className="w-full border p-2 rounded text-black"
                  value={screenForm.name}
                  onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">Yol</label>
                <input
                  className="w-full border p-2 rounded text-black"
                  value={screenForm.url}
                  onChange={(e) => setScreenForm({ ...screenForm, url: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScreenModal(false)}
                  className="bg-gray-200 px-4 py-2 rounded text-black"
                >
                  İptal
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded">Tanımla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
