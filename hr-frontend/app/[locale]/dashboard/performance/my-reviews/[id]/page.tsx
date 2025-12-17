import PerformanceReviewDetailView from "../../../../../views/ReviewDetailView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PerformanceReviewDetailView reviewId={Number(id)} />;
}
