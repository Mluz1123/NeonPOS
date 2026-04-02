import { describe, it, expect } from 'vitest';
import { SaleSchema } from '@/lib/schemas';

describe('SaleSchema validation', () => {
  const validSale = {
    cash_register_id: '123e4567-e89b-12d3-a456-426614174000',
    total_amount: 5000,
    tax_amount: 800,
    payment_method: 'cash',
    items: [
      {
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        quantity: 2,
        unit_price: 2500,
        subtotal: 5000,
      }
    ]
  };

  it('validates a correct sale payload', () => {
    const result = SaleSchema.safeParse(validSale);
    expect(result.success).toBe(true);
  });

  it('fails if items array is empty', () => {
    const result = SaleSchema.safeParse({ ...validSale, items: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El carrito está vacío');
    }
  });

  it('fails if payment_method is invalid', () => {
    const result = SaleSchema.safeParse({ ...validSale, payment_method: 'bitcoin' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Método de pago inválido');
    }
  });

  it('fails if a product_id within items is not a UUID', () => {
    const result = SaleSchema.safeParse({
      ...validSale,
      items: [{ ...validSale.items[0], product_id: 'not-a-uuid' }]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Producto inválido');
    }
  });

  it('fails if quantity is less than 1', () => {
    const result = SaleSchema.safeParse({
      ...validSale,
      items: [{ ...validSale.items[0], quantity: 0 }]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('La cantidad debe ser al menos 1');
    }
  });

  it('coerces strings to numbers for amounts', () => {
    const result = SaleSchema.safeParse({
      ...validSale,
      total_amount: '5000',
      tax_amount: '800'
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total_amount).toBe(5000);
      expect(result.data.tax_amount).toBe(800);
    }
  });
});
