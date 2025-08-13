import { formatMoney, parseMoneyToMinor, formatMoneyInput, getCurrencySymbol } from './currency';

describe('Currency Utility', () => {
  describe('formatMoney', () => {
    it('should format QAR amounts correctly', () => {
      expect(formatMoney(12345, 'QAR')).toBe('QAR 123.45');
      expect(formatMoney(100, 'QAR')).toBe('QAR 1.00');
      expect(formatMoney(0, 'QAR')).toBe('QAR 0.00');
    });

    it('should format USD amounts correctly', () => {
      expect(formatMoney(12345, 'USD')).toBe('$123.45');
      expect(formatMoney(100, 'USD')).toBe('$1.00');
    });

    it('should use QAR as default', () => {
      expect(formatMoney(12345)).toBe('QAR 123.45');
    });
  });

  describe('parseMoneyToMinor', () => {
    it('should parse money strings to minor units', () => {
      expect(parseMoneyToMinor('123.45')).toBe(12345);
      expect(parseMoneyToMinor('1.00')).toBe(100);
      expect(parseMoneyToMinor('0.50')).toBe(50);
      expect(parseMoneyToMinor('100')).toBe(10000);
    });

    it('should handle invalid inputs', () => {
      expect(parseMoneyToMinor('')).toBe(0);
      expect(parseMoneyToMinor('invalid')).toBe(0);
      expect(parseMoneyToMinor('123.456')).toBe(12346); // rounds up
    });
  });

  describe('formatMoneyInput', () => {
    it('should format minor units for input display', () => {
      expect(formatMoneyInput(12345)).toBe('123.45');
      expect(formatMoneyInput(100)).toBe('1.00');
      expect(formatMoneyInput(0)).toBe('0.00');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct currency symbols', () => {
      expect(getCurrencySymbol('QAR')).toBe('ر.ق');
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('EUR')).toBe('€');
      expect(getCurrencySymbol()).toBe('ر.ق'); // default
    });
  });
});
