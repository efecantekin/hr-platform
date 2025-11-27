import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center py-12">
      {/* Dönen Daire (Tailwind animate-spin) */}
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 text-sm font-medium">Veriler Yükleniyor...</p>
    </div>
  );
}
