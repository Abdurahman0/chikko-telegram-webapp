"use client";

import { Button } from "@/components/shared/button";
import type { LocationPoint } from "@/types/telegram-webapp";

export function LocationPickerPlaceholder({
  title,
  hint,
  actionLabel,
  pickedLabel,
  location,
  onPickLocation,
}: {
  title: string;
  hint: string;
  actionLabel: string;
  pickedLabel: string;
  location: LocationPoint | null;
  onPickLocation: () => void;
}) {
  return (
    <div className="rounded-2xl bg-surface-soft p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-app-muted">{hint}</p>
      {location ? (
        <p className="mt-2 text-xs text-brand-strong">
          {pickedLabel}: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </p>
      ) : null}
      <Button variant="soft" className="mt-3" type="button" onClick={onPickLocation}>
        {actionLabel}
      </Button>
    </div>
  );
}
