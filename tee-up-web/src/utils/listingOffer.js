import { getConversations, getMessages } from '../api/chatApi';
import { parseOfferMessage } from './chatOffers';

/** Returns the buyer's locked offer amount for a listing, or null if none yet. */
export async function getExistingUserOfferForListing(userId, sellerId, listingId) {
  if (!userId || !sellerId || !listingId) return null;

  const data = await getConversations();
  const conv = (data?.conversations || []).find(
    (c) =>
      String(c.listing_id) === String(listingId) &&
      String(c.seller_id) === String(sellerId)
  );
  if (!conv?.conversation_id) return null;

  const messagesRes = await getMessages(conv.conversation_id);
  const messages = messagesRes?.messages || [];
  const myOffer = [...messages]
    .reverse()
    .find(
      (m) =>
        String(m.sender_id) === String(userId) &&
        parseOfferMessage(m.message) != null
    );

  return myOffer ? parseOfferMessage(myOffer.message) : null;
}
