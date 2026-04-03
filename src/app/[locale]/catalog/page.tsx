"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { CategoryChips } from "@/components/catalog/category-chips";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductSkeletonGrid } from "@/components/catalog/product-skeleton-grid";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { useCatalog } from "@/features/catalog/use-catalog";
import { useCart } from "@/features/cart/use-cart";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { isSupportedLocale } from "@/lib/i18n/config";

export default function CatalogPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <CatalogScreen locale={locale} />;
}

function CatalogScreen({ locale }: { locale: "uz" | "ru" }) {
  const { messages } = useI18n();
  useCatalog();
  const status = useCatalogStore((state) => state.status);
  const categories = useCatalogStore((state) => state.categories);
  const products = useCatalogStore((state) => state.products);
  const search = useCatalogStore((state) => state.search);
  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const setSearch = useCatalogStore((state) => state.setSearch);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const initData = useBootstrapStore((state) => state.initData);
  const addItem = useCartStore((state) => state.addItem);
  const cart = useCart();

  const hasProducts = useMemo(() => products.length > 0, [products.length]);

  return (
    <div className="space-y-4">
      <SectionHeader
        title={messages.catalog.title}
        subtitle={messages.catalog.subtitle}
        right={
          <Link
            href={`/${locale}/cart`}
            className="rounded-xl bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-strong"
          >
            {messages.nav.cart}: {cart.totals.quantity}
          </Link>
        }
      />

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={messages.catalog.searchPlaceholder}
      />

      <CategoryChips
        categories={categories}
        activeCategory={activeCategory}
        allLabel={messages.catalog.allCategories}
        onSelect={setCategory}
      />

      {status === "loading" ? <ProductSkeletonGrid /> : null}

      {status === "error" ? (
        <StateCard
          title={messages.checkout.failed}
          action={
            <Button
              onClick={() =>
                void loadCatalog({
                  initData,
                  category: activeCategory || undefined,
                  search: search || undefined,
                })
              }
            >
              {messages.common.retry}
            </Button>
          }
        />
      ) : null}

      {status === "success" && !hasProducts ? (
        <StateCard
          title={messages.catalog.emptyTitle}
          description={messages.catalog.emptyDescription}
        />
      ) : null}

      {status === "success" && hasProducts ? (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              locale={locale}
              product={product}
              addToCartLabel={messages.catalog.addToCart}
              outOfStockLabel={messages.catalog.outOfStock}
              inStockLabel={messages.catalog.inStock}
              detailsLabel={messages.catalog.details}
              currencyLabel={messages.common.som}
              onAddToCart={addItem}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
