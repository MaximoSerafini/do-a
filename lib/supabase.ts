import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type ProductType = 'burger' | 'combo' | 'drink'

export interface Product {
    id: string
    name: string
    type: ProductType
    image_url: string
    price_simple?: number
    price_doble?: number
    price_triple?: number
    price?: number
    description?: string
    description_simple?: string
    description_doble?: string
    description_triple?: string
    active: boolean
    created_at: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Order {
    id: string
    items: OrderItem[]
    total: number
    delivery_type: 'pickup' | 'delivery'
    payment_method: 'efectivo' | 'transferencia'
    address?: string
    status: OrderStatus
    created_at: string
}

export interface OrderItem {
    name: string
    size: string
    quantity: number
    price: number
    image?: string
}

export interface Ingredient {
    id: string
    name: string
    quantity: number
    unit: string
    min_stock: number
    created_at: string
}
