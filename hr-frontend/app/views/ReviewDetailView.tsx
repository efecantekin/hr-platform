"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { performanceService } from "../../services/performanceService";
// Tipleri doğru yerden alıyoruz
import type { PerformanceReview, SurveyTemplate, ReviewResponse } from "../../types";

// UI Bileşenleri
import Loading from "../../components/ui/Loading";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function PerformanceReviewDetailView({ reviewId }: { reviewId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [template, setTemplate] = useState<SurveyTemplate | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // { questionId: value }

  // Görüntüleme modu kontrolü (URL'den veya statüden)
  const isViewMode = searchParams.get("mode") === "view";
  const isCompleted = review?.status === "COMPLETED";
  const isReadOnly = isViewMode || isCompleted;

  useEffect(() => {
    if (reviewId) loadData();
  }, [reviewId]);

  const loadData = async () => {
    try {
      // 1. İnceleme detayını çek
      const rev = await performanceService.getReviewDetail(reviewId);
      setReview(rev);

      // Varsa mevcut cevapları state'e doldur (Backend'den cevaplar geliyorsa buraya eklenmeli)
      // Şimdilik sadece template çekiyoruz

      // 2. Şablon sorularını çek
      if (rev && rev.templateId) {
        const tpl = await performanceService.getTemplateById(rev.templateId);
        setTemplate(tpl);
      }
    } catch (e) {
      console.error("Veri yükleme hatası:", e);
      alert("Veri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !confirm("Anketi göndermek ve tamamlamak istediğinize emin misiniz? Bu işlem geri alınamaz.")
    )
      return;

    // Cevapları backend formatına çevir
    const responseList: ReviewResponse[] = Object.entries(answers).map(([qId, val]) => ({
      questionId: Number(qId),
      answerValue: val,
    }));

    try {
      await performanceService.submitReview(reviewId, responseList);
      alert("Değerlendirme başarıyla gönderildi!");
      router.push("/dashboard/performance/my-reviews");
    } catch (e) {
      console.error("Gönderim hatası:", e);
      alert("Hata oluştu.");
    }
  };

  const handleAnswerChange = (qId: number, value: string) => {
    if (isReadOnly) return; // Salt okunursa değiştirmeyi engelle
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  if (loading) return <Loading />;
  if (!review || !template)
    return <div className="p-8 text-center text-gray-500">Kayıt bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* BAŞLIK VE DURUM */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{template.title}</h1>
          <p className="text-gray-500 mt-1">{template.description}</p>
          <div className="flex gap-2 mt-2 text-xs text-gray-400">
            <span>
              Dönem: <strong>{review.period}</strong>
            </span>
            <span>•</span>
            <span>
              Tip: <strong>{review.reviewType}</strong>
            </span>
          </div>
        </div>
        <Badge variant={review.status === "COMPLETED" ? "success" : "warning"}>
          {review.status === "COMPLETED" ? "Tamamlandı" : "Bekliyor"}
        </Badge>
      </div>

      {/* SORULAR LİSTESİ */}
      <div className="max-w-4xl mx-auto space-y-6">
        {template.questions.map((q, index) => (
          <Card key={q.id || index} className="p-6">
            <div className="flex gap-4">
              <span className="font-bold text-lg text-blue-600">{index + 1}.</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800 mb-4 text-lg">{q.text}</p>

                {/* 1. Metin Sorusu */}
                {q.type === "TEXT" && (
                  <textarea
                    className={`w-full border p-3 rounded focus:ring-2 focus:ring-blue-200 outline-none min-h-[100px] text-black ${
                      isReadOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                    placeholder={isReadOnly ? "Cevap yok" : "Cevabınızı buraya yazınız..."}
                    value={answers[q.id!] || ""}
                    onChange={(e) => handleAnswerChange(q.id!, e.target.value)}
                    disabled={isReadOnly}
                  />
                )}

                {/* 2. Puanlama (1-10) */}
                {q.type === "RATING" && (
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        disabled={isReadOnly}
                        onClick={() => handleAnswerChange(q.id!, score.toString())}
                        className={`w-10 h-10 rounded-full font-bold transition ${
                          answers[q.id!] === score.toString()
                            ? "bg-blue-600 text-white shadow-lg scale-110"
                            : isReadOnly
                            ? "bg-gray-100 text-gray-400"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Çoktan Seçmeli */}
                {q.type === "MULTIPLE_CHOICE" && q.options && (
                  <div className="space-y-2">
                    {q.options.split(",").map((opt, i) => (
                      <label
                        key={i}
                        className={`flex items-center space-x-3 p-2 border rounded ${
                          !isReadOnly && "cursor-pointer hover:bg-gray-50"
                        } ${isReadOnly ? "bg-gray-50" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.trim()}
                          checked={answers[q.id!] === opt.trim()}
                          onChange={(e) => handleAnswerChange(q.id!, e.target.value)}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                          disabled={isReadOnly}
                        />
                        <span className="text-gray-700">{opt.trim()}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Buton sadece düzenleme modunda görünür */}
        {!isReadOnly && (
          <div className="flex justify-end pt-4 pb-12">
            <Button onClick={handleSubmit} className="px-8 py-3 text-lg shadow-lg">
              Değerlendirmeyi Tamamla ve Gönder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
