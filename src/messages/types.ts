export type Messages = {
  nav: {
    catalog: string;
    cart: string;
    orders: string;
    profile: string;
  };
  common: {
    loading: string;
    retry: string;
    empty: string;
    som: string;
    pieces: string;
    unknown: string;
    continueShopping: string;
    goToCart: string;
    openCatalog: string;
  };
  bootstrap: {
    loading: string;
    forbidden: string;
    network: string;
  };
  catalog: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    emptyTitle: string;
    emptyDescription: string;
    tryAnotherSearch: string;
    addToCart: string;
    outOfStock: string;
    inStock: string;
    details: string;
  };
  product: {
    quantity: string;
    addToCart: string;
    outOfStock: string;
    stockLeft: string;
    notFound: string;
    noEndpointNote: string;
  };
  cart: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    clear: string;
    subtotal: string;
    total: string;
    checkout: string;
  };
  checkout: {
    title: string;
    subtitle: string;
    fullName: string;
    phone: string;
    address: string;
    location: string;
    locationHint: string;
    useCurrentLocation: string;
    locationPicked: string;
    paymentMethod: string;
    orderSummary: string;
    submit: string;
    submitting: string;
    validationTitle: string;
    addressOrLocation: string;
    requiredCart: string;
    click: string;
    payme: string;
    fallbackPaymentMethods: string;
    failed: string;
  };
  success: {
    title: string;
    subtitle: string;
    orderId: string;
    paymentMethod: string;
    total: string;
    status: string;
    paymentStatus: string;
    toOrders: string;
  };
  orders: {
    title: string;
    subtitle: string;
    activeOrder: string;
    historyOrder: string;
    orderItems: string;
    noActiveOrder: string;
    noHistoryEndpoint: string;
    noHistoryEndpointDetail: string;
    guestModeTitle: string;
    guestModeDescription: string;
  };
  profile: {
    title: string;
    subtitle: string;
    telegramName: string;
    telegramUsername: string;
    fullName: string;
    phone: string;
    address: string;
    saveSoon: string;
    noUpdateEndpoint: string;
  };
};
