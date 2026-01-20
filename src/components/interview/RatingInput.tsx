"use client";

interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function RatingInput({
  label,
  value,
  onChange,
  max = 5,
}: RatingInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">
          {value}/{max}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded ${
              n <= value ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
