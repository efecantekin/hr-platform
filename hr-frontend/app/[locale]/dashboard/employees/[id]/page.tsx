// src/app/dashboard/employees/[id]/page.tsx
import EmployeeDetailView from "../../../../views/EmployeeDetailView";

// Next.js 15+ için params Promise döner
export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeDetailView employeeId={Number(id)} />;
}
