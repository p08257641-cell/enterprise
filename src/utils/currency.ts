export function formatCurrency(value: number | undefined | null, currencyCode?: string): string {
  const amount = value || 0;
  const code = currencyCode || 'USD';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    console.warn(`Invalid currency code: ${code}`);
    return `${code} ${amount.toFixed(2)}`;
  }
}

export function getCurrencySymbol(currencyCode?: string): string {
  const code = currencyCode || 'USD';
  const symbols: Record<string, string> = {
    GHS: 'GH₵',
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    CAD: 'CA$',
    AUD: 'A$',
  };
  return symbols[code.toUpperCase()] || code;
}

