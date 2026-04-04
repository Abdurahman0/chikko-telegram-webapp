"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LocationPickerPlaceholder } from "@/components/checkout/location-picker-placeholder";
import { PaymentMethods } from "@/components/checkout/payment-methods";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { useCart } from "@/features/cart/use-cart";
import { useSubmitCheckout } from "@/features/checkout/use-submit-checkout";
import { formatCurrency } from "@/lib/formatters/currency";
import { isSupportedLocale } from "@/lib/i18n/config";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCartStore } from "@/store/cart-store";
import { useCheckoutStore } from "@/store/checkout-store";
import type { PaymentMethod } from "@/types/telegram-webapp";

export default function CheckoutPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <CheckoutScreen locale={locale} />;
}

function CheckoutScreen({ locale }: { locale: "uz" | "ru" }) {
  const { messages } = useI18n();
  const router = useRouter();
  const customer = useBootstrapStore((state) => state.customer);
  const paymentMethods = useBootstrapStore((state) => state.paymentMethods);
  const prefillFromCustomer = useCheckoutStore((state) => state.prefillFromCustomer);
  const draft = useCheckoutStore((state) => state.draft);
  const setDraftField = useCheckoutStore((state) => state.setDraftField);
  const clearCart = useCartStore((state) => state.clear);
  const { list, totals, isEmpty } = useCart();
  const { submit, isSubmitting, submitError, setSubmitError } = useSubmitCheckout();
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    prefillFromCustomer(customer);
  }, [prefillFromCustomer, customer]);

  const availablePaymentMethods = useMemo<PaymentMethod[]>(
    () => (paymentMethods.length > 0 ? paymentMethods : ["payme", "click"]),
    [paymentMethods],
  );

  const paymentLabels: Record<PaymentMethod, string> = {
    click: messages.checkout.click,
    payme: messages.checkout.payme,
  };

  const onPickLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError(messages.checkout.locationHint);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationError(null);
        setDraftField("location", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocationError(messages.checkout.locationHint);
      },
      {
        enableHighAccuracy: true,
      },
    );
  };

  const onSubmit = async () => {
    setSubmitError(null);
    if (isEmpty) {
      setSubmitError("empty_cart");
      return;
    }
    const payloadItems = list.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    }));
    const result = await submit({
      fullName: draft.fullName,
      phone: draft.phone,
      address: draft.address,
      paymentMethod: draft.paymentMethod,
      location: draft.location,
      items: payloadItems,
    });
    if (result) {
      clearCart();
      router.push(`/${locale}/success`);
    }
  };

  if (isEmpty) {
    return (
      <StateCard
        title={messages.cart.emptyTitle}
        description={messages.checkout.requiredCart}
        action={
          <Link href={`/${locale}/catalog`}>
            <Button>{messages.common.openCatalog}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader title={messages.checkout.title} subtitle={messages.checkout.subtitle} />

      {paymentMethods.length === 0 ? (
        <StateCard title={messages.checkout.fallbackPaymentMethods} />
      ) : null}

      <div className="rounded-3xl bg-surface p-4 shadow-soft space-y-3">
        <Input
          value={draft.fullName}
          onChange={(event) => setDraftField("fullName", event.target.value)}
          placeholder={messages.checkout.fullName}
        />
        <Input
          value={draft.phone}
          onChange={(event) => setDraftField("phone", event.target.value)}
          placeholder={messages.checkout.phone}
        />
        <Input
          value={draft.address}
          onChange={(event) => setDraftField("address", event.target.value)}
          placeholder={messages.checkout.address}
        />
        <LocationPickerPlaceholder
          locale={locale}
          title={messages.checkout.location}
          hint={messages.checkout.locationHint}
          actionLabel={messages.checkout.useCurrentLocation}
          pickedLabel={messages.checkout.locationPicked}
          location={draft.location}
          addressValue={draft.address}
          onAddressChange={(nextAddress) => setDraftField("address", nextAddress)}
          onSelectLocation={(nextLocation) => setDraftField("location", nextLocation)}
          onPickLocation={onPickLocation}
        />
        {locationError ? <p className="text-xs text-app-muted">{locationError}</p> : null}
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-soft space-y-2">
        <p className="text-sm font-semibold">{messages.checkout.paymentMethod}</p>
        <PaymentMethods
          methods={availablePaymentMethods}
          selected={draft.paymentMethod}
          labels={paymentLabels}
          onSelect={(value) => setDraftField("paymentMethod", value)}
        />
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-sm font-semibold">{messages.checkout.orderSummary}</p>
        <div className="mt-2 space-y-2">
          {list.map((item) => (
            <div key={item.productId} className="flex items-center justify-between text-sm">
              <span className="max-w-52 truncate text-app-muted">
                {item.name} x{item.quantity}
              </span>
              <span className="font-semibold">
                {formatCurrency(item.price * item.quantity, locale)} {messages.common.som}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-surface-accent pt-3 text-sm font-bold">
          <span>{messages.cart.total}</span>
          <span>
            {formatCurrency(totals.total, locale)} {messages.common.som}
          </span>
        </div>
      </div>

      {submitError ? (
        <StateCard
          title={messages.checkout.validationTitle}
          description={
            submitError === "address_or_location_required"
              ? messages.checkout.addressOrLocation
              : submitError === "empty_cart"
                ? messages.checkout.requiredCart
                : messages.checkout.failed
          }
        />
      ) : null}

      <Button fullWidth onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? messages.checkout.submitting : messages.checkout.submit}
      </Button>
    </div>
  );
}
