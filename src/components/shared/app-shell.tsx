import type { PropsWithChildren } from "react";
import { BottomNav } from "@/components/shared/bottom-nav";
import { FloatingReloadButton } from "@/components/shared/floating-reload-button";

export function AppShell({
  locale,
  children,
}: PropsWithChildren<{ locale: string }>) {
  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden px-4 pt-3">
      <FloatingReloadButton />
      <main className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-24">
        {children}
      </main>
      <BottomNav locale={locale} />
    </div>
  );
}
