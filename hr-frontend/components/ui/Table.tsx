import React from "react";

// Kolon Tanımı Arayüzü (Generic)
export interface Column<T> {
  header: string; // Tablo başlığı (Örn: "Ad Soyad")
  accessorKey?: keyof T; // Verinin hangi alanı? (Örn: "firstName")
  className?: string; // Özel CSS (Örn: "text-right")
  // Özel içerik render etmek istersek (Örn: Butonlar, Badge'ler)
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}

// GENERIC DATATABLE BİLEŞENİ
// T extends { id: any } -> Gönderilen verinin mutlaka bir 'id' alanı olmalı (Key için)
export default function DataTable<T extends { id: any }>({
  data,
  columns,
  emptyMessage = "Kayıt bulunamadı.",
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto bg-white shadow rounded-lg border border-gray-100">
      <table className="min-w-full leading-normal">
        {/* --- BAŞLIKLAR --- */}
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            {columns.map((col, index) => (
              <th key={index} className={`px-5 py-3 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* --- SATIRLAR --- */}
        <tbody className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-gray-500 italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition duration-150"
              >
                {columns.map((col, index) => (
                  <td
                    key={`${row.id}-${index}`}
                    className={`px-5 py-4 text-sm ${col.className || ""}`}
                  >
                    {/* MANTIK:
                        1. Eğer 'cell' fonksiyonu varsa onu çalıştır (Custom Render).
                        2. Yoksa ve 'accessorKey' varsa o veriyi yaz.
                        3. Hiçbiri yoksa boş bırak.
                    */}
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                        ? (row[col.accessorKey] as React.ReactNode)
                        : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
