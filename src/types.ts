export interface Review {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice: number | null;
  badge: string | null;
  category: string; // e.g., 'burgers', 'combos', 'drinks', 'desserts', 'sides'
  imageUrl: string;
  gallery: string[];
  ingredients: string[];
  fullDescription: string;
  estimatedTime: string;
  isFeatured: boolean;
  isPromo: boolean;
  isActive: boolean;
  salesCount: number;
  reviews: Review[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  expiryDate: string; // YYYY-MM-DD
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  obs: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pendente' | 'em_preparo' | 'enviado' | 'entregue' | 'cancelado';
  timestamp: string;
}

export interface Settings {
  whatsappNumber: string;
  storeOpen: boolean;
  estimatedDeliveryTime: string;
  deliveryFee: number;
}
