"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-surface-accent bg-surface px-4 py-3 text-sm text-app-text placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
