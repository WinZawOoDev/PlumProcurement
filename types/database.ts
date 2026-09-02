export interface IPrice {
    id: number
    price: number
    unit: string
    category: string
    is_available: boolean
    created_at?: string
    updated_at?: string
}

export interface IPurchase {
    id: number
    price_id: number
    seller_id: number | null
    category: string
    unit: string
    unit_price: number
    quantity: number
    total: number
    created_at?: string
}

export interface IPurchaseWithSeller extends IPurchase {
    seller_name: string | null
}

export interface ISeller {
    id: number
    name: string
    phone: string | null
    address: string | null
}

export interface ISellerStat {
    seller_id: number
    purchase_count: number
    total_spent: number
}
