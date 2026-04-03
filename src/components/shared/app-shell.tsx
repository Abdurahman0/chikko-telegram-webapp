import type { PropsWithChildren } from "react";
import { BottomNav } from "@/components/shared/bottom-nav";

export function AppShell({
  locale,
  children,
}: PropsWithChildren<{ locale: string }>) {
  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden px-4 pt-3">
      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
        {children}
      </main>
      <BottomNav locale={locale} />
    </div>
  );
}
