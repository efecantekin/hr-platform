"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "../../../types";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

interface SortableQuestionProps {
  q: Question;
  index: number;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof Question, value: any) => void;
}

export default function SortableQuestion({ q, index, onRemove, onChange }: SortableQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: q.localId!,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-4 border rounded-lg mb-3 shadow-sm group hover:border-blue-300 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        {/* Tutma Sapı */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-gray-400 mr-3 p-1 hover:bg-gray-100 rounded self-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <Input
              label={`Soru ${index + 1}`}
              placeholder="Soru metnini giriniz..."
              value={q.text}
              onChange={(e) => onChange(q.localId!, "text", e.target.value)}
              className="mb-0"
            />
          </div>
          <div className="md:col-span-4 flex items-end">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded border w-full text-center">
              {q.type === "TEXT"
                ? "📝 Metin"
                : q.type === "RATING"
                ? "⭐ 1-10 Puan"
                : "🔘 Çoktan Seçmeli"}
            </span>
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => onRemove(q.localId!)}
          className="ml-3 mt-6"
        >
          ✕
        </Button>
      </div>

      {/* Çoktan Seçmeli Ayarları */}
      {q.type === "MULTIPLE_CHOICE" && (
        <div className="ml-10 mt-2 p-3 bg-gray-50 rounded border border-gray-100">
          <Input
            label="Seçenekler (Virgülle ayırarak yazın)"
            placeholder="Örn: Çok İyi, İyi, Orta, Geliştirilmeli"
            value={q.options || ""}
            onChange={(e) => onChange(q.localId!, "options", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
