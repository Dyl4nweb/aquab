export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  waterType: string;
  containerType: string;
  capacity: string;
  price: number;
  supportsExchange: boolean;
  newContainerFee: number;
  imageUrl: string;
  stock: number;
  minStockAlert: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  waterType: string;
  containerType: string;
  capacity: string;
  unitPrice: number;
  supportsExchange: boolean;
  isExchange: boolean; // true = refill/exchange (customer brings empty), false = new container
  containerFee: number; // 0 if isExchange or product doesn't support exchange, otherwise newContainerFee
  quantity: number;
  imageUrl: string;
  availableStock: number;
}

export interface CheckoutFormValues {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  barangayId: string;
  barangayName: string;
  landmarkOrNotes: string;
  deliveryMethod: 'DELIVERY' | 'PICKUP';
  deliveryDate: string;
  deliveryTimeSlot: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'GCASH';
  gcashReference?: string;
}

export interface BarangayItem {
  id: string;
  name: string;
  municipality: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryMinutes: number;
  isActive: boolean;
}

export interface BusinessSettingItem {
  id: string;
  businessName: string;
  tagline: string;
  municipality: string;
  address: string;
  phone: string;
  email: string;
  openingHour: string;
  closingHour: string;
  operatingDays: string;
  gcashNumber: string;
  gcashName: string;
  defaultDeliveryFee: number;
  containerDepositFee: number;
  announcement: string | null;
}

