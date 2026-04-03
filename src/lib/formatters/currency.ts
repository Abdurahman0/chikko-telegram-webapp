import type { AppLocale } from "@/lib/i18n/config";

export function formatCurrency(value: number, locale: AppLocale) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "uz-UZ", {
    maximumFractionDigits: 0,
  }).format(value);
}
