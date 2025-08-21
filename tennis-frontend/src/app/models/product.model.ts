export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  created_at?: string;
}

export interface CartItem {
  id: number;
  user_id?: number;
  product_id?: number;
  productId?: number;
  quantity: number;
  name: string;
  product_name?: string;
  price: number;
  image: string;
  image_url?: string;
  size?: string;
  stock?: number;
  created_at?: string;
}

export interface OrderItem {
  id: number;
  order_id?: number;
  orderId?: number;
  product_id?: number;
  productId?: number;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
  product?: Product;
}

export interface Order {
  id: number;
  user_id?: number;
  userId?: number;
  total: number;
  status: string;
  created_at?: string;
  orderDate?: string;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  orderId: number;
  message: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
