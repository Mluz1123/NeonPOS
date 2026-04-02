import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  barcode: z.string().optional(),
  category_id: z.string().uuid('Categoría inválida'),
  purchase_price: z.coerce.number().min(0, 'Precio inválido'),
  sale_price: z.coerce.number().min(0, 'Precio inválido'),
  stock_actual: z.coerce.number().int().min(0, 'Stock inválido'),
  stock_min: z.coerce.number().int().min(0, 'Stock inválido'),
  is_active: z.boolean().default(true),
  image_url: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
});

export const SaleSchema = z.object({
  cash_register_id: z.string().uuid('Caja registradora inválida'),
  total_amount: z.coerce.number().min(0, 'Monto inválido'),
  tax_amount: z.coerce.number().min(0, 'Impuesto inválido'),
  payment_method: z.enum(['cash', 'card', 'transfer'], { errorMap: () => ({ message: 'Método de pago inválido' }) }),
  customer_name: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid('Producto inválido'),
    quantity: z.coerce.number().int().min(1, 'La cantidad debe ser al menos 1'),
    unit_price: z.coerce.number().min(0, 'Precio unitario inválido'),
    subtotal: z.coerce.number().min(0, 'Subtotal inválido'),
  })).min(1, 'El carrito está vacío'),
});

export const CashMovementSchema = z.object({
  cash_register_id: z.string().uuid('Caja registradora inválida'),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: 'Tipo de movimiento inválido' }) }),
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a cero'),
  reason: z.string().min(3, 'La razón debe tener al menos 3 caracteres'),
});
