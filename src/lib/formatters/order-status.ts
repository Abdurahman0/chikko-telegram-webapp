import type { AppLocale } from "@/lib/i18n/config";

function fallbackLabel(value?: string | null) {
  if (!value) {
    return "";
  }
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

const orderStatusLabels: Record<string, { uz: string; ru: string }> = {
  created: { uz: "Qabul qilindi", ru: "Принят" },
  pending: { uz: "Kutilmoqda", ru: "Ожидается" },
  waiting_payment: { uz: "To'lov kutilmoqda", ru: "Ожидает оплату" },
  processing: { uz: "Jarayonda", ru: "В обработке" },
  shipped: { uz: "Jo'natildi", ru: "Отправлен" },
  delivered: { uz: "Yetkazildi", ru: "Доставлен" },
  completed: { uz: "Yakunlandi", ru: "Завершен" },
  paid: { uz: "To'langan", ru: "Оплачен" },
  canceled: { uz: "Bekor qilingan", ru: "Отменен" },
  cancelled: { uz: "Bekor qilingan", ru: "Отменен" },
};

const paymentStatusLabels: Record<string, { uz: string; ru: string }> = {
  pending: { uz: "Kutilmoqda", ru: "Ожидается" },
  waiting: { uz: "Kutilmoqda", ru: "Ожидается" },
  paid: { uz: "To'langan", ru: "Оплачен" },
  success: { uz: "Muvaffaqiyatli", ru: "Успешно" },
  failed: { uz: "Muvaffaqiyatsiz", ru: "Неуспешно" },
  canceled: { uz: "Bekor qilingan", ru: "Отменен" },
  cancelled: { uz: "Bekor qilingan", ru: "Отменен" },
};

export function formatOrderStatus(status: string | undefined, locale: AppLocale) {
  if (!status) {
    return "";
  }
  const normalized = status.toLowerCase();
  const translated = orderStatusLabels[normalized];
  if (translated) {
    return translated[locale];
  }
  return fallbackLabel(status);
}

export function formatPaymentStatus(status: string | undefined, locale: AppLocale) {
  if (!status) {
    return "";
  }
  const normalized = status.toLowerCase();
  const translated = paymentStatusLabels[normalized];
  if (translated) {
    return translated[locale];
  }
  return fallbackLabel(status);
}

export function formatPaymentMethod(method: string | undefined, locale: AppLocale) {
  if (!method) {
    return locale === "uz" ? "Noma'lum" : "Неизвестно";
  }
  const normalized = method.toLowerCase();
  if (normalized === "payme") {
    return "Payme";
  }
  if (normalized === "click") {
    return "Click";
  }
  return fallbackLabel(method);
}
