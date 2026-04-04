import { getTelegramWebApp } from "@/lib/telegram/webapp";

type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error"
  | "selection";

export function triggerHaptic(enabled: boolean, type: HapticType = "light") {
  if (!enabled) {
    return;
  }

  const haptic = getTelegramWebApp()?.HapticFeedback;
  if (!haptic) {
    return;
  }

  if (type === "selection") {
    haptic.selectionChanged();
    return;
  }

  if (type === "success" || type === "warning" || type === "error") {
    haptic.notificationOccurred(type);
    return;
  }

  haptic.impactOccurred(type);
}
