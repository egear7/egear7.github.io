type Props = {
  checked: boolean;
  variant?: "light" | "dark";
};

export function SquareCheckbox({ checked, variant = "dark" }: Props) {
  if (variant === "light") {
    return (
      <span
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center border ${
          checked
            ? "border-ink bg-ink text-white"
            : "border-ink/40 bg-white"
        }`}
        aria-hidden="true"
      >
        {checked ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path
              d="M5 12.5 9.5 17 19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
            />
          </svg>
        ) : (
          <span className="h-2 w-2 bg-ink/40" />
        )}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center border ${
        checked ? "border-green bg-green text-navy-950" : "border-white/35 bg-transparent"
      }`}
      aria-hidden="true"
    >
      {checked ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M5 12.5 9.5 17 19 7"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="square"
          />
        </svg>
      ) : (
        <span className="h-1.5 w-1.5 bg-white/30" />
      )}
    </span>
  );
}