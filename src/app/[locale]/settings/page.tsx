"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { FloatingBackButton } from "@/components/shared/floating-back-button";
import { SectionHeader } from "@/components/shared/section-header";
import { useI18n } from "@/components/shared/locale-provider";
import { isSupportedLocale, type AppLocale } from "@/lib/i18n/config";
import { useAppSettingsStore } from "@/store/app-settings-store";
import { useCartStore } from "@/store/cart-store";
import { useCheckoutStore } from "@/store/checkout-store";

export default function SettingsPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <SettingsScreen locale={locale} />;
}

function SettingsScreen({ locale }: { locale: AppLocale }) {
  const { messages } = useI18n();
  const notificationsEnabled = useAppSettingsStore((state) => state.notificationsEnabled);
  const hapticsEnabled = useAppSettingsStore((state) => state.hapticsEnabled);
  const autoPlayPromotions = useAppSettingsStore((state) => state.autoPlayPromotions);
  const compactCards = useAppSettingsStore((state) => state.compactCards);
  const setNotificationsEnabled = useAppSettingsStore(
    (state) => state.setNotificationsEnabled,
  );
  const setHapticsEnabled = useAppSettingsStore((state) => state.setHapticsEnabled);
  const setAutoPlayPromotions = useAppSettingsStore(
    (state) => state.setAutoPlayPromotions,
  );
  const setCompactCards = useAppSettingsStore((state) => state.setCompactCards);

  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const setDraftField = useCheckoutStore((state) => state.setDraftField);
  const clearCheckoutResult = useCheckoutStore((state) => state.clearCheckoutResult);

  const hasCartItems = Object.keys(cartItems).length > 0;

  const text =
    locale === "uz"
      ? {
          subtitle: "Ilova ishlashini boshqarish",
          preferences: "Ilova sozlamalari",
          notifications: "Bildirishnomalar",
          notificationsHint: "Buyurtma holati yangiliklari",
          haptics: "Vibratsiya effekti",
          hapticsHint: "Tugmalar uchun tebranish javobi",
          promotions: "Promo slider auto-play",
          promotionsHint: "Katalog banneri avtomatik aylansin",
          compactCards: "Ixcham kartalar",
          compactCardsHint: "Katalogda yanada kompakt ko'rinish",
          dataSection: "Mahalliy ma'lumotlar",
          dataHint: "Qurilmadagi vaqtinchalik holat",
          clearCart: "Savatni tozalash",
          resetCheckout: "Checkout maydonlarini tozalash",
          alreadyEmpty: "Savat allaqachon bo'sh",
          profileHint: "Til, biz haqimizda va kontaktlar Profil sahifasida.",
        }
      : {
          subtitle: "Управление поведением приложения",
          preferences: "Настройки приложения",
          notifications: "Уведомления",
          notificationsHint: "Обновления статуса заказа",
          haptics: "Тактильный отклик",
          hapticsHint: "Вибро-отклик на действия",
          promotions: "Автопрокрутка промо",
          promotionsHint: "Автоматическая смена баннера в каталоге",
          compactCards: "Компактные карточки",
          compactCardsHint: "Более плотный вид каталога",
          dataSection: "Локальные данные",
          dataHint: "Временные данные на этом устройстве",
          clearCart: "Очистить корзину",
          resetCheckout: "Очистить данные checkout",
          alreadyEmpty: "Корзина уже пустая",
          profileHint: "Язык, о нас и контакты находятся в Профиле.",
        };

  const resetCheckoutDraft = () => {
    setDraftField("fullName", "");
    setDraftField("phone", "");
    setDraftField("address", "");
    setDraftField("location", null);
    setDraftField("paymentMethod", "payme");
    clearCheckoutResult();
  };

  return (
    <div className="space-y-4 pt-12">
      <FloatingBackButton href={`/${locale}/profile`} />
      <SectionHeader title={messages.profile.settingsTitle} subtitle={text.subtitle} />

      <div className="rounded-3xl bg-surface p-2 shadow-soft">
        <p className="px-2 pb-2 pt-1 text-sm font-semibold">{text.preferences}</p>

        <SettingToggleRow
          title={text.notifications}
          description={text.notificationsHint}
          checked={notificationsEnabled}
          onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
        />

        <SettingToggleRow
          title={text.haptics}
          description={text.hapticsHint}
          checked={hapticsEnabled}
          onToggle={() => setHapticsEnabled(!hapticsEnabled)}
        />

        <SettingToggleRow
          title={text.promotions}
          description={text.promotionsHint}
          checked={autoPlayPromotions}
          onToggle={() => setAutoPlayPromotions(!autoPlayPromotions)}
        />

        <SettingToggleRow
          title={text.compactCards}
          description={text.compactCardsHint}
          checked={compactCards}
          onToggle={() => setCompactCards(!compactCards)}
        />
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-sm font-semibold">{text.dataSection}</p>
        <p className="mt-1 text-xs text-app-muted">{text.dataHint}</p>

        <div className="mt-3 space-y-2">
          <Button
            fullWidth
            variant="danger"
            disabled={!hasCartItems}
            onClick={clearCart}
            className="h-10"
          >
            {hasCartItems ? text.clearCart : text.alreadyEmpty}
          </Button>
          <Button fullWidth variant="soft" onClick={resetCheckoutDraft} className="h-10">
            {text.resetCheckout}
          </Button>
        </div>
      </div>

      <p className="px-1 text-xs text-app-muted">{text.profileHint}</p>
    </div>
  );
}

function SettingToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2.5">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-app-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          checked ? "bg-brand" : "bg-surface-accent"
        }`}
      >
        <span
          className={`inline-flex h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
