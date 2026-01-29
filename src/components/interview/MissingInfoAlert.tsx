"use client";

interface MissingInfoAlertProps {
  items: string[];
  onAskAbout?: (item: string) => void;
}

export function MissingInfoAlert({ items, onAskAbout }: MissingInfoAlertProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="size-4 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="text-sm font-medium text-amber-800">
          不足情報の指摘
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">・</span>
            {onAskAbout ? (
              <button
                type="button"
                onClick={() => onAskAbout(item)}
                className="text-sm text-amber-800 hover:text-amber-900 hover:underline text-left"
              >
                {item}
              </button>
            ) : (
              <span className="text-sm text-amber-800">{item}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
