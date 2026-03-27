export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled'
export type UserStatus = 'Approved' | 'Suspended' | 'Pending'
export type UserRole = 'admin' | 'seller'

export type PaymentMethod = 'UPI' | 'Net Banking' | 'Credit Card' | 'Debit Card' | 'Cash on Delivery' | 'Wallet'
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded'

export interface PaymentInfo {
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string
  gateway: string
  paidAt?: string
  bank?: string
  upiId?: string
  cardLast4?: string
  refundedAt?: string
  refundReason?: string
  timeline: { event: string; time: string }[]
}

export interface Order {
  id: string
  orderNo: string
  userName: string
  userEmail: string
  products: { name: string; qty: number; price: number }[]
  amount: number
  status: OrderStatus
  payment: PaymentInfo
  shippingDetails: {
    address: string
    city: string
    state: string
    pincode: string
    phone: string
    trackingId?: string
    carrier?: string
  }
  invoiceUrl?: string
  createdAt: string
  updatedAt: string
}

export type PriceCategory = 'wholesaler' | 'retailer' | 'guest'

export interface ProductPricing {
  wholesaler?: number
  retailer?: number
  guest?: number
}

export interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  brand: string
  model?: string
  price: number          // base/fallback price
  pricing: ProductPricing // role-based prices
  mrp?: number
  tax: number
  quantity: number
  description: string
  bulletPoints: string[]
  images: string[]
  priceCategory?: PriceCategory  // which pricing to default-show
  featured: boolean
  featuredPosition?: number
  totalOrders: number
  costUpdatedAt: string
  createdAt: string
  otherAdditions?: number
  otherDeductions?: number
}

export interface SellerUser {
  id: string
  fullName: string
  userId: string
  phone: string
  email: string
  address: string
  gst: string
  status: UserStatus
  role: UserRole
  createdAt: string
  password?: string
}

export interface ClientBalance {
  id: string
  name: string
  email: string
  phone: string
  balance: number
  status: 'Active' | 'Inactive' | 'Suspended'
  lastUpdated: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalSellers: number
  revenueGrowth: number
  orderGrowth: number
  productGrowth: number
  sellerGrowth: number
}

export interface ChartDataPoint {
  name: string
  revenue: number
  orders: number
}
