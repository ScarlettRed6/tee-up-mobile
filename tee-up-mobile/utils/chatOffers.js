const OFFER_PREFIX = '__OFFER__::';

export function buildOfferMessage(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return `${OFFER_PREFIX}${numeric}`;
}

export function parseOfferMessage(message) {
  if (typeof message !== 'string') return null;
  if (!message.startsWith(OFFER_PREFIX)) return null;
  const rawValue = message.slice(OFFER_PREFIX.length);
  const amount = Number(rawValue);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

export function formatOfferMessage(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  try {
    return `Offered ₱${numeric.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
  } catch {
    return `Offered ₱${numeric}`;
  }
}

export function formatChatSnippet(message) {
  if (typeof message !== 'string') return '';
  const trimmed = message.trim();
  if (!trimmed) return '';
  const offerAmount = parseOfferMessage(trimmed);
  if (offerAmount != null) return formatOfferMessage(offerAmount);
  return message;
}
