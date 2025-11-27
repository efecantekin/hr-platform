export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white shadow rounded-lg overflow-hidden border border-gray-100 ${className || ""}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
      <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}
