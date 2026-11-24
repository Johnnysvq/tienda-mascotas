interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
}

const buttonClass =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white " +
  "text-lg leading-none text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
export function QuantityStepper({
  value,
  min = 1,
  max,
  label,
  onChange,
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-2"
    >
      <button
        type="button"
        className={buttonClass}
        aria-label="Disminuir cantidad"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span
        className="min-w-8 text-center font-medium tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={buttonClass}
        aria-label="Aumentar cantidad"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
