const OFFER_PREFIX = '__OFFER__::';

export function parseOfferMessage(message) {
  if (typeof message !== 'string') return null;
  if (!message.startsWith(OFFER_PREFIX)) return null;
  const rawValue = message.slice(OFFER_PREFIX.length);
  const amount = Number(rawValue);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

export function isOfferMessage(message) {
  return parseOfferMessage(message) != null;
}
