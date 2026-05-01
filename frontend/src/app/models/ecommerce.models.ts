export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  condition: string;
  sellerId: number;
  images: ProductImage[];
  attributes?: { [key: string]: any };
  active: boolean;
  stockQuantity?: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  imageUrl: string;
  primary: boolean;
  orderNum: number;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  iconUrl?: string;
  description?: string;
  createdAt: string;
}

export interface CartItem {
  id: number;
  productId: string;
  productTitle: string;
  productImageUrl?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  updatedAt: string;
}

export interface Order {
  id: number;
  userId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  promoCode?: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingPhone?: string;
  trackingNumber?: string;
  notes?: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: number;
  productId: string;
  productTitle: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderStatusHistory {
  status: string;
  comment?: string;
  changedBy: string;
  changedAt: string;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  shippingCity?: string;
  shippingPhone: string;
  promoCode?: string;
  notes?: string;
}

export interface PaymentIntent {
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency: string;
  status: string;
}

export interface Favorite {
  id: number;
  userId: string;
  productId: string;
  productTitle?: string;
  productPrice?: number;
  productImageUrl?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  status: string;
  adminResponse?: AdminResponse;
  createdAt: string;
}

export interface AdminResponse {
  adminId: string;
  response: string;
  respondedAt: string;
}

export interface ProductRating {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export interface Promotion {
  id: number;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  maxUses: number;
  maxUsesPerUser: number;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
}

export interface ApplyPromoResponse {
  code: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountDescription: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface AiChatRequest {
  message: string;
  userId: string;
  conversationId?: string;
}

export interface AiChatResponse {
  response: string;
  conversationId: string;
  suggestions?: string[];
}