export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled'
export type UserStatus = 'Approved' | 'Suspended' | 'Pending'
export type UserRole = 'admin' | 'seller'

export interface Order {
  id: string
  orderNo: string
  userName: string
  userEmail: string
  products: { name: string; qty: number; price: number }[]
  amount: number
  status: OrderStatus
  shippingDetails: {
    address: string
    city: string
    state: string
    pincode: string
    phone: string
    trackingId?: string
    carrier?: string
  }
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  brand: string
  price: number
  mrp?: number
  tax: number
  quantity: number
  description: string
  bulletPoints: string[]
  images: string[]
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
