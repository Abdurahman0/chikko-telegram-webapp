export type PaymentMethod = "payme" | "click";

export type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
};

export type TelegramUser = {
  id?: number | string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
};

export type Customer = {
  id?: number | string;
  fullName?: string;
  phone?: string;
  address?: string;
};

export type LocationPoint = {
  latitude: number;
  longitude: number;
};

export type Brand = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  productsCount?: number;
};

export type Product = {
  id: string;
  name: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  currency: string;
  stock?: number | null;
  categoryId?: string | null;
  categoryName?: string;
  brandId?: string | null;
  brandName?: string;
  isFavorite?: boolean;
  image?: string | null;
  images: string[];
  rating?: number;
  reviewsCount?: number;
};

export type CatalogCategory = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  image?: string | null;
  imageUrl?: string | null;
};

export type OrderItem = {
  id?: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  image?: string | null;
};

export type Order = {
  id: string;
  status?: string;
  paymentStatus?: string;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  createdAt?: string;
  contactName?: string;
  contactPhone?: string;
  shippingAddress?: string;
};

export type Payment = {
  method: PaymentMethod;
  status?: string;
  amount?: number;
  paymentUrl?: string;
};

export type BootstrapData = {
  user: TelegramUser | null;
  customer: Customer | null;
  activeOrder: Order | null;
  paymentMethods: PaymentMethod[];
};

export type CatalogData = {
  categories: CatalogCategory[];
  brands: Brand[];
  promotedProducts: Product[];
  products: Product[];
};

export type CategoryDetailData = {
  category: CatalogCategory;
  brands: Brand[];
  products: Product[];
};

export type CheckoutPayload = {
  full_name: string;
  phone: string;
  payment_method: PaymentMethod;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
};

export type CheckoutData = {
  order: Order;
  payment: Payment;
};

export type OrdersData = {
  guestMode: boolean;
  orders: Order[];
};

export type FavoritesData = {
  products: Product[];
};

export type Review = {
  id: string;
  orderId: string;
  comment: string;
  requestedAt?: string;
  submittedAt?: string;
  source?: string;
  order?: Order;
  rating?: number;
};

export type ReviewsData = {
  reviews: Review[];
  pendingOrders: Order[];
};

export type ProfileData = {
  guestMode: boolean;
  user: TelegramUser | null;
  customer: Customer | null;
  activeOrder: Order | null;
  orderHistory: Order[];
  favorites: Product[];
  pendingReviews: Order[];
};

export type CatalogSortOption = "cheap" | "expensive" | "new" | "popular" | "high_rating";

export type ApiErrorCode = "forbidden" | "bad_request" | "network" | "unknown";
