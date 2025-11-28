"use client";

import React, { useState, useEffect, useRef } from "react";

interface MultiSelectProps {
  label?: string;
  options: string[]; // Seçilebilir tüm teknolojiler
  value: string; // Backend'den gelen virgüllü string (Örn: "Java,React")
  onChange: (value: string) => void; // Değişince virgüllü string döner
  placeholder?: string;
}

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Virgüllü string'i diziye çevir (Boşsa boş dizi)
  const selectedItems = value ? value.split(",").filter((item) => item.trim() !== "") : [];

  // Dışarı tıklandığında kapatma mantığı
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    let newSelection;
    if (selectedItems.includes(option)) {
      newSelection = selectedItems.filter((item) => item !== option);
    } else {
      newSelection = [...selectedItems, option];
    }
    // Dizi -> String çevirip yukarı gönder
    onChange(newSelection.join(","));
    setSearchTerm(""); // Seçimden sonra aramayı temizle
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = selectedItems.filter((item) => item !== option);
    onChange(newSelection.join(","));
  };

  // Arama filtresi (Seçili olmayanları göster)
  const filteredOptions = options.filter(
    (opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedItems.includes(opt)
  );

  return (
    <div className="mb-4" ref={wrapperRef}>
      {label && <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>}

      <div
        className="relative w-full border border-gray-300 roundedbg-white min-h-[42px] flex flex-wrap items-center gap-1 p-1 bg-white cursor-text focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition"
        onClick={() => setIsOpen(true)}
      >
        {/* SEÇİLİ ETİKETLER */}
        {selectedItems.map((item) => (
          <span
            key={item}
            className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1"
          >
            {item}
            <button
              onClick={(e) => removeOption(item, e)}
              className="text-blue-500 hover:text-blue-700 font-bold focus:outline-none"
            >
              ×
            </button>
          </span>
        ))}

        {/* ARAMA INPUTU */}
        <input
          type="text"
          className="flex-1 min-w-[60px] outline-none text-sm p-1 bg-transparent"
          placeholder={selectedItems.length === 0 ? placeholder : ""}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {/* DROPDOWN LİSTE */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto z-50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                  onClick={() => toggleOption(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400">Sonuç bulunamadı.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
