"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "block h-12 w-full min-w-0 max-w-full rounded-[18px] border-2 border-surface-accent bg-surface px-4 text-sm text-app-text placeholder:text-app-muted focus:border-brand focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
