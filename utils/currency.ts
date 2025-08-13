export type Currency = 'QAR' | 'USD' | 'EUR';

export const defaultCurrency: Currency = 'QAR';

export const formatMoney = (minor: number, currency: Currency = defaultCurrency) =>
  new Intl.NumberFormat('en-QA', { style: 'currency', currency }).format(minor / 100);

export const parseMoneyToMinor = (amountString: string): number => {
  // Remove currency symbols and commas, parse as float, convert to minor units
  const cleanAmount = amountString.replace(/[^\d.-]/g, '');
  const amount = parseFloat(cleanAmount);
  
  if (isNaN(amount)) return 0;
  
  // Convert to minor units (e.g., 123.45 -> 12345)
  return Math.round(amount * 100);
};

export const formatMoneyInput = (amountMinor: number, currency: Currency = defaultCurrency): string => {
  const amount = amountMinor / 100;
  return amount.toFixed(2);
};

export const getCurrencySymbol = (currency: Currency = defaultCurrency): string => {
  switch (currency) {
    case 'QAR':
      return 'ر.ق';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return 'ر.ق';
  }
};
