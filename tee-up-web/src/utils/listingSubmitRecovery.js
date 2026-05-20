import { getListings } from '../api/userListingsApi';

/** Uploads with multiple photos can exceed default HTTP timeouts on slow networks. */
export const LISTING_UPLOAD_TIMEOUT_MS = 120000;

export function isAmbiguousListingSubmitError(error) {
  if (!error) return false;
  const code = error.code;
  if (code === 'ECONNABORTED' || code === 'ERR_NETWORK' || code === 'ETIMEDOUT') {
    return true;
  }
  const message = (error.message || '').toLowerCase();
  if (message.includes('timeout') || message.includes('network error')) {
    return true;
  }
  // Response never arrived (common when connection drops after server finished).
  return !error.response && !!error.request;
}

function listingPriceValue(listing) {
  const raw = listing?.price;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function listingCreatedAtMs(listing) {
  const raw = listing?.date_posted ?? listing?.created_at ?? listing?.postedDate;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

/**
 * If the server saved the listing but the client never got the response,
 * find a very recent match among the user's listings.
 */
export async function findLikelyCreatedListing(userId, listingData, withinMinutes = 8) {
  if (!userId || !listingData?.title) return null;

  const expectedTitle = listingData.title.trim();
  const expectedPrice = Number(listingData.price);
  const expectedCategory = listingData.category;
  const cutoff = Date.now() - withinMinutes * 60 * 1000;

  try {
    const listings = await getListings({
      user_id: userId,
      sort: 'newest',
    });

    if (!Array.isArray(listings)) return null;

    return (
      listings.find((row) => {
        const title = (row.title || '').trim();
        if (title !== expectedTitle) return false;
        if (expectedCategory && row.category !== expectedCategory) return false;
        if (Number.isFinite(expectedPrice)) {
          const rowPrice = listingPriceValue(row);
          if (rowPrice == null || Math.abs(rowPrice - expectedPrice) > 0.009) {
            return false;
          }
        }
        return listingCreatedAtMs(row) >= cutoff;
      }) ?? null
    );
  } catch {
    return null;
  }
}

export function ambiguousListingSubmitMessage() {
  return 'Connection was interrupted while uploading. Your listing may still have been posted — check My Listings before trying again.';
}
