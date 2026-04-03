export const locales = ["uz", "ru"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "uz";

export function isSupportedLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}

export function detectLocaleFromLanguageCode(
  languageCode?: string | null,
): AppLocale {
  const normalized = languageCode?.toLowerCase();
  if (normalized?.startsWith("ru")) {
    return "ru";
  }
  return "uz";
}
