"use client";

import { useState } from "react";
import { performanceService } from "../../../../../services/performanceService";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Card from "../../../../../components/ui/Card";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "@/types";

// Sürükle-Bırak Soru Bileşeni
function SortableQuestion({ q, index, onRemove, onChange }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: q.localId,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-4 border rounded mb-3 shadow-sm relative group"
    >
      <div className="flex justify-between items-start mb-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-gray-400 mr-2 p-1 hover:bg-gray-100 rounded"
        >
          ☰
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Soru Metni</label>
            <input
              className="w-full border-b focus:border-blue-500 outline-none py-1"
              value={q.text}
              onChange={(e) => onChange(q.localId, "text", e.target.value)}
              placeholder="Soru giriniz..."
            />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {q.type}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(q.localId)}
          className="text-red-400 hover:text-red-600 ml-2"
        >
          ✕
        </button>
      </div>

      {q.type === "MULTIPLE_CHOICE" && (
        <div className="ml-8 mt-2">
          <label className="text-xs text-gray-400">Seçenekler (Virgülle ayırın)</label>
          <input
            className="w-full border p-2 rounded text-sm mt-1"
            value={q.options || ""}
            onChange={(e) => onChange(q.localId, "options", e.target.value)}
            placeholder="Örn: Çok İyi, İyi, Orta, Kötü"
          />
        </div>
      )}
    </div>
  );
}

export default function PerformanceTemplateView() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<(Question & { localId: string })[]>([]);

  const addQuestion = (type: "TEXT" | "RATING" | "MULTIPLE_CHOICE") => {
    setQuestions([
      ...questions,
      { localId: crypto.randomUUID(), text: "", type, orderIndex: questions.length, options: "" },
    ]);
  };

  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions(questions.map((q) => (q.localId === id ? { ...q, [field]: value } : q)));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.localId !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((i) => i.localId === active.id);
        const newIndex = items.findIndex((i) => i.localId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (!title) return alert("Başlık giriniz");
    try {
      // orderIndex'i güncelle
      const finalQuestions = questions.map((q, idx) => ({ ...q, orderIndex: idx }));
      await performanceService.createTemplate({ title, description, questions: finalQuestions });
      alert("Şablon kaydedildi!");
      setTitle("");
      setDescription("");
      setQuestions([]);
    } catch (e) {
      alert("Hata oluştu");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Performans Anketi Oluştur</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL: AYARLAR VE ARAÇLAR */}
        <Card className="h-fit">
          <div className="p-4 border-b">
            <Input label="Anket Başlığı" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              label="Açıklama"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="p-4">
            <label className="block text-xs font-bold text-gray-600 mb-3">Soru Tipi Ekle</label>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addQuestion("TEXT")}
              >
                📝 Metin Sorusu
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addQuestion("RATING")}
              >
                ⭐ 1-10 Puanlama
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addQuestion("MULTIPLE_CHOICE")}
              >
                🔘 Çoktan Seçmeli
              </Button>
            </div>
          </div>
          <div className="p-4 border-t">
            <Button className="w-full" onClick={handleSave}>
              Şablonu Kaydet
            </Button>
          </div>
        </Card>

        {/* SAĞ: ÖNİZLEME VE DÜZENLEME */}
        <div className="col-span-2">
          <div className="bg-gray-100 p-4 rounded-lg min-h-[500px]">
            {questions.length === 0 && (
              <p className="text-center text-gray-400 mt-10">
                Soldan soru tipi ekleyerek başlayın.
              </p>
            )}

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={questions.map((q) => q.localId)}
                strategy={verticalListSortingStrategy}
              >
                {questions.map((q, index) => (
                  <SortableQuestion
                    key={q.localId}
                    q={q}
                    index={index}
                    onRemove={handleRemoveQuestion}
                    onChange={handleQuestionChange}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}
