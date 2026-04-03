"use client";

import { cn } from "@/lib/utils/cn";
import type { PaymentMethod } from "@/types/telegram-webapp";

export function PaymentMethods({
  methods,
  selected,
  labels,
  onSelect,
}: {
  methods: PaymentMethod[];
  selected: PaymentMethod;
  labels: Record<PaymentMethod, string>;
  onSelect: (value: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {methods.map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => onSelect(method)}
          className={cn(
            "rounded-2xl border px-4 py-3 text-left text-sm font-semibold",
            selected === method
              ? "border-brand bg-brand-soft text-brand-strong"
              : "border-surface-accent bg-surface text-app-muted",
          )}
        >
          {labels[method]}
        </button>
      ))}
    </div>
  );
}
