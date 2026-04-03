import { detectLocaleFromLanguageCode, type AppLocale } from "@/lib/i18n/config";
import type { TelegramThemeParams, TelegramUser } from "@/types/telegram-webapp";

export function getTelegramWebApp() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.Telegram?.WebApp ?? null;
}

export function initializeTelegramWebApp() {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return null;
  }
  webApp.ready();
  webApp.expand();
  applyTelegramTheme(webApp.themeParams ?? {});
  return webApp;
}

export function getTelegramInitData() {
  const webApp = getTelegramWebApp();
  return webApp?.initData ?? "";
}

export function getTelegramUser(): TelegramUser | null {
  const user = getTelegramWebApp()?.initDataUnsafe?.user;
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    languageCode: user.language_code,
  };
}

export function getTelegramLanguageCode() {
  return getTelegramWebApp()?.initDataUnsafe?.user?.language_code ?? null;
}

export function getTelegramPreferredLocale(): AppLocale {
  return detectLocaleFromLanguageCode(getTelegramLanguageCode());
}

export function applyTelegramTheme(theme: TelegramThemeParams) {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  if (theme.bg_color) {
    root.style.setProperty("--app-bg", theme.bg_color);
  }
  if (theme.text_color) {
    root.style.setProperty("--app-text", theme.text_color);
  }
  if (theme.hint_color) {
    root.style.setProperty("--app-muted", theme.hint_color);
  }
  if (theme.secondary_bg_color) {
    root.style.setProperty("--surface-soft", theme.secondary_bg_color);
  }
  if (theme.button_color) {
    root.style.setProperty("--brand", theme.button_color);
  }
}
