const ORIGINAL_PRICE_KEYS = [
  'original_price',
  'originalPrice',
  'previous_price',
  'previousPrice',
  'old_price',
  'oldPrice',
  'compare_at_price',
  'compareAtPrice',
  'price_before_markdown',
  'priceBeforeMarkdown',
];

export function toValidPriceNumber(value) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric;
}

export function getOriginalPrice(listing) {
  if (!listing || typeof listing !== 'object') return null;
  for (const key of ORIGINAL_PRICE_KEYS) {
    const parsed = toValidPriceNumber(listing[key]);
    if (parsed != null) return parsed;
  }
  return null;
}

export function getPriceDisplayData(listing) {
  const currentPrice = toValidPriceNumber(listing?.price);
  const originalPrice = getOriginalPrice(listing);
  const hasMarkdown =
    currentPrice != null &&
    originalPrice != null &&
    originalPrice > currentPrice;

  return { currentPrice, originalPrice, hasMarkdown };
}

export function formatPhpPrice(price, minimumFractionDigits = 0) {
  const parsed = toValidPriceNumber(price);
  if (parsed == null) return '—';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits,
  }).format(parsed);
}
