import type { ReactNode } from "react";

export function StateCard({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-surface p-5 shadow-soft">
      <p className="text-base font-semibold">{title}</p>
      {description ? <p className="mt-2 text-sm text-app-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
