const priceFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 851 -> "851.00", 1234.5 -> "1,234.50". */
export const formatPrice = (value: number) => priceFormat.format(value);

/** 28.94 -> "28.94 %" (the reference puts a space before the sign). */
export const formatPercent = (value: number) => `${priceFormat.format(value)} %`;

/** UTC timestamp -> "01 Oct 2026" (built by hand: some locales write "Sept"). */
export function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${String(date.getUTCDate()).padStart(2, '0')} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
