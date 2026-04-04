import { detectLocaleFromLanguageCode, type AppLocale } from "@/lib/i18n/config";
import type { TelegramThemeParams, TelegramUser } from "@/types/telegram-webapp";

const TELEGRAM_INIT_DATA_CACHE_KEY = "chikko_tg_init_data";

function readInitDataFromUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const sources = [window.location.search];
  if (window.location.hash.includes("?")) {
    sources.push(window.location.hash.slice(window.location.hash.indexOf("?")));
  }

  for (const source of sources) {
    const params = new URLSearchParams(source.startsWith("?") ? source.slice(1) : source);
    const value = params.get("tgWebAppData") ?? params.get("telegramInitData");
    if (value) {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return "";
}

function extractChatIdFromInitData(initData: string) {
  if (!initData) {
    return "";
  }

  const params = new URLSearchParams(initData);
  const direct = params.get("chat_id");
  if (direct) {
    return direct;
  }

  const parseJsonId = (value: string | null) => {
    if (!value) {
      return "";
    }
    try {
      const parsed = JSON.parse(value) as { id?: string | number };
      if (parsed?.id !== undefined && parsed?.id !== null) {
        return String(parsed.id);
      }
      return "";
    } catch {
      return "";
    }
  };

  const fromChat = parseJsonId(params.get("chat"));
  if (fromChat) {
    return fromChat;
  }

  const fromUser = parseJsonId(params.get("user"));
  if (fromUser) {
    return fromUser;
  }

  const chatInstance = params.get("chat_instance");
  return chatInstance ?? "";
}

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
  const fromWebApp = webApp?.initData ?? "";

  if (fromWebApp) {
    try {
      window.sessionStorage.setItem(TELEGRAM_INIT_DATA_CACHE_KEY, fromWebApp);
    } catch {
      // ignore storage errors
    }
    return fromWebApp;
  }

  const fromUrl = readInitDataFromUrl();
  if (fromUrl) {
    try {
      window.sessionStorage.setItem(TELEGRAM_INIT_DATA_CACHE_KEY, fromUrl);
    } catch {
      // ignore storage errors
    }
    return fromUrl;
  }

  try {
    return window.sessionStorage.getItem(TELEGRAM_INIT_DATA_CACHE_KEY) ?? "";
  } catch {
    return "";
  }
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

export function getTelegramChatId() {
  const webApp = getTelegramWebApp();
  const fromUserId = webApp?.initDataUnsafe?.user?.id;
  if (fromUserId !== undefined && fromUserId !== null) {
    return String(fromUserId);
  }

  const initData = getTelegramInitData();
  return extractChatIdFromInitData(initData);
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
