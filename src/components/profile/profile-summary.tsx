export function ProfileSummary({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-soft">
      <p className="text-xs text-app-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value?.trim() || "-"}</p>
    </div>
  );
}
