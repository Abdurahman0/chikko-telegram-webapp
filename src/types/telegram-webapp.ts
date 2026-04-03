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

export type Product = {
  id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  price: number;
  currency: string;
  stock?: number | null;
  categoryId?: string | null;
  categoryName?: string;
  image?: string | null;
  images: string[];
};

export type CatalogCategory = {
  id: string;
  name: string;
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

export type ProfileData = {
  guestMode: boolean;
  user: TelegramUser | null;
  customer: Customer | null;
  activeOrder: Order | null;
  orderHistory: Order[];
};

export type ApiErrorCode = "forbidden" | "bad_request" | "network" | "unknown";
