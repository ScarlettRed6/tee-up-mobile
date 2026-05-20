import { getFollowersForUser } from "../models/followerModel.js";
import { findUserById } from "../models/userModel.js";
import { createNotification } from "./notifications.js";
import { sendNotification } from "./socketHandler.js";

/** Only public marketplace listings should alert followers (not drafts/pending or sold). */
export function normalizeListingStatus(status) {
    return String(status || "").trim().toLowerCase();
}

export function isPublicListingStatus(status) {
    return normalizeListingStatus(status) === "available";
}

/** Notify when a listing becomes public for the first time (e.g. draft → available). */
export function shouldNotifyFollowersOnStatusChange(previousStatus, newStatus) {
    return (
        isPublicListingStatus(newStatus) &&
        !isPublicListingStatus(previousStatus)
    );
}

/**
 * Notify followers about a new listing. Run after the HTTP response is sent
 * so slow networks do not time out while this work completes.
 */
export async function notifyFollowersNewListing(io, sellerId, listing, titleFallback = "") {
    if (!sellerId || !listing?.listing_id) return;

    const listingStatus = normalizeListingStatus(listing.status);
    if (!isPublicListingStatus(listingStatus)) return;

    try {
        const followers = await getFollowersForUser(sellerId);
        if (!followers?.length) return;

        const seller = await findUserById(sellerId);
        const sellerName = seller?.name || "Someone";
        const listingTitle = listing.title || titleFallback || "";
        const message = listingTitle
            ? `${sellerName} posted a new listing "${listingTitle}"`
            : `${sellerName} posted a new listing`;

        for (const follower of followers) {
            try {
                const notif = await createNotification(
                    follower.follower_id,
                    "followed_new_listing",
                    message,
                    {
                        listing_id: listing.listing_id,
                        listing_title: listingTitle,
                        seller_id: sellerId,
                        seller_name: sellerName,
                    }
                );
                if (io) {
                    sendNotification(io, follower.follower_id, notif);
                }
            } catch (err) {
                console.error(
                    `Failed to notify follower ${follower.follower_id} about listing ${listing.listing_id}:`,
                    err.message
                );
            }
        }
    } catch (err) {
        console.error("Failed to notify followers about new listing:", err.message);
    }
}
