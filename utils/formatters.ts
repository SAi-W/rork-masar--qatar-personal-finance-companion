import { formatMoney } from './currency';

export const formatCurrency = (amountMajor: number): string => {
  // temporary bridge until DB uses minor units
  return formatMoney(Math.round(amountMajor * 100)); // QAR default
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
};