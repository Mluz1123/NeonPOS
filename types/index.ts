export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  barcode?: string;
  category_id: string;
  purchase_price: number;
  sale_price: number;
  stock_actual: number;
  stock_min: number;
  is_active: boolean;
  category?: Category;
}

export interface SaleItem {
  id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  total_amount: number;
  tax_amount: number;
  payment_method: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'cancelled';
  customer_name?: string;
  items: SaleItem[];
  created_at: string;
}

export interface CashRegister {
  id: string;
  opened_at: string;
  closed_at?: string;
  initial_amount: number;
  final_amount?: number;
  expected_amount?: number;
  status: 'open' | 'closed';
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'loss';
  quantity: number;
  reason?: string;
  created_at: string;
}
