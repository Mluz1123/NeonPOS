import { describe, it, expect } from 'vitest';
import { ProductSchema } from './products';

describe('ProductSchema validation', () => {
  const validProduct = {
    name: 'Coca Cola',
    category_id: '123e4567-e89b-12d3-a456-426614174000',
    purchase_price: 1500,
    sale_price: 2500,
    stock_actual: 50,
    stock_min: 10,
    is_active: true,
  };

  it('validates a correct product payload', () => {
    const result = ProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('fails if name is empty', () => {
    const result = ProductSchema.safeParse({ ...validProduct, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Nombre requerido');
    }
  });

  it('fails if category_id is not a valid UUID', () => {
    const result = ProductSchema.safeParse({ ...validProduct, category_id: '123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Categoría inválida');
    }
  });

  it('coerces string numbers to numbers for prices and stocks', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      purchase_price: '1500',
      sale_price: '2500',
      stock_actual: '50',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.purchase_price).toBe(1500);
      expect(result.data.stock_actual).toBe(50);
    }
  });

  it('fails if prices are negative', () => {
    const result = ProductSchema.safeParse({ ...validProduct, sale_price: -100 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Precio inválido');
    }
  });

  it('fails if stock is negative', () => {
    const result = ProductSchema.safeParse({ ...validProduct, stock_actual: -5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Stock inválido');
    }
  });
});
