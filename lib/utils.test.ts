import { describe, it, expect } from 'vitest';
import { cn, formatCurrency } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes properly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
      expect(cn('p-4', null, undefined, 'm-2')).toBe('p-4 m-2');
    });

    it('resolves tailwind conflicts correctly via tailwind-merge', () => {
      expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
    });
  });

  describe('formatCurrency', () => {
    it('formats a number correctly into COP', () => {
      const result = formatCurrency(15000);
      expect(result).toMatch(/\$15\.?000/);
    });

    it('formats a string number correctly into COP', () => {
      const result = formatCurrency('15000');
      expect(result).toMatch(/\$15\.?000/);
    });

    it('handles zero values', () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/\$0/);
    });

    it('handles falsy or empty values as zero', () => {
      // @ts-ignore testing invalid input specifically
      const result = formatCurrency('');
      expect(result).toMatch(/\$0/);
    });
  });
});
