import { describe, it, expect } from 'vitest';
import { CashMovementSchema } from './cash';

describe('CashMovementSchema validation', () => {
  const validMovement = {
    cash_register_id: '123e4567-e89b-12d3-a456-426614174000',
    type: 'income',
    amount: 15000,
    reason: 'Venta especial'
  };

  it('validates a correct income movement payload', () => {
    const result = CashMovementSchema.safeParse(validMovement);
    expect(result.success).toBe(true);
  });

  it('validates a correct expense movement payload', () => {
    const result = CashMovementSchema.safeParse({ ...validMovement, type: 'expense' });
    expect(result.success).toBe(true);
  });

  it('fails if amount is zero or less', () => {
    const result = CashMovementSchema.safeParse({ ...validMovement, amount: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El monto debe ser mayor a cero');
    }
  });

  it('fails if reason is too short', () => {
    const result = CashMovementSchema.safeParse({ ...validMovement, reason: 'Hi' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('La razón debe tener al menos 3 caracteres');
    }
  });

  it('fails if type is invalid', () => {
    // @ts-ignore
    const result = CashMovementSchema.safeParse({ ...validMovement, type: 'transfer' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Tipo de movimiento inválido');
    }
  });

  it('coerces string amount to number', () => {
    const result = CashMovementSchema.safeParse({ ...validMovement, amount: '25000.50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount)    .toBe(25000.5);
    }
  });
});
