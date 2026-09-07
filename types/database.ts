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
    seller_id: number | null
    total: number
    purchased_at?: string
    created_at?: string
    updated_at?: string
}

export interface IPurchaseItem {
    id: number
    purchase_id: number
    price_id: number | null
    category: string
    unit: string
    unit_price: number
    quantity: number
    line_total: number
}

export interface IPurchaseWithSeller extends IPurchase {
    seller_name: string | null
}

export interface IPurchaseDetail extends IPurchaseWithSeller {
    items: IPurchaseItem[]
}

export interface IPayment {
    id: number
    seller_id: number
    purchase_id: number | null
    amount: number
    method: string | null
    note: string | null
    paid_at?: string
    created_at?: string
}

export interface IPaymentWithSeller extends IPayment {
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

export interface ISellerPaymentStat {
    seller_id: number
    seller_name: string | null
    total_owed: number
    total_paid: number
    balance: number
}
