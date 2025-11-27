import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export default function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="mb-4">
      {label && <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>}
      <div className="relative">
        <select
          className={`w-full border p-2 pr-8 rounded text-black text-sm focus:ring-2 focus:ring-primary-light outline-none transition appearance-none bg-white ${error ? "border-danger" : "border-gray-300"} ${className}`}
          {...props}
        >
          <option value="" disabled>
            Seçiniz
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
