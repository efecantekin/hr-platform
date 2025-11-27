export default function Badge({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "warning" | "neutral";
}) {
  const styles = {
    primary: "bg-primary-light text-primary",
    success: "bg-green-100 text-success",
    danger: "bg-red-100 text-danger",
    warning: "bg-yellow-100 text-yellow-800",
    neutral: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[variant]}`}>
      {children}
    </span>
  );
}
