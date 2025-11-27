interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>}
      <input
        className={`w-full border p-2 rounded text-black text-sm focus:ring-2 focus:ring-blue-100 outline-none transition ${error ? "border-red-500" : "border-gray-300"} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
