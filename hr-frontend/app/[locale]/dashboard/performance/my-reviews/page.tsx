"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { performanceService } from "../../../../../services/performanceService";
import DataTable, { Column } from "../../../../../components/ui/Table";
import Button from "../../../../../components/ui/Button";
import Badge from "../../../../../components/ui/Badge";
import Loading from "../../../../../components/ui/Loading";
import Card from "../../../../../components/ui/Card";
import { PerformanceReview } from "@/types";

export default function PerformanceMyReviewsView() {
  const router = useRouter();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const myId = localStorage.getItem("employeeId");
    if (myId) fetchReviews(Number(myId));
  }, []);

  const fetchReviews = async (id: number) => {
    try {
      const data = await performanceService.getMyPendingReviews(id);
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePush = (id: number) => () => {
    console.log("review id => ", id);
    router.push(`/dashboard/performance/my-reviews/${id}`);
  };

  const columns: Column<PerformanceReview>[] = [
    { header: "Anket Başlığı", accessorKey: "templateTitle", className: "font-medium" },
    { header: "Değerlendirilecek Kişi ID", accessorKey: "employeeId", className: "text-gray-600" },
    {
      header: "Durum",
      cell: (r) => (
        <Badge variant={r.status === "COMPLETED" ? "success" : "warning"}>{r.status}</Badge>
      ),
    },
    {
      header: "İşlem",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end">
          {r.status === "PENDING" ? (
            <Button size="sm" onClick={handlePush(r.id)}>
              Değerlendir
            </Button>
          ) : (
            <span className="text-green-600 font-bold text-sm">Tamamlandı</span>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bekleyen Değerlendirmelerim</h1>
      <Card>
        <DataTable data={reviews} columns={columns} emptyMessage="Bekleyen değerlendirme yok." />
      </Card>
    </div>
  );
}
