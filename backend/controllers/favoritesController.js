import { addFavorite, removeFavorite, getUserFavorites } from "../models/favoritesModel.js";
import { getListingById } from "../models/listingsModel.js";
import { createNotification } from "../utils/notifications.js";
import { sendNotification } from "../utils/socketHandler.js";
import { getIO } from "../utils/getIo.js";
import { findUserById } from "../models/userModel.js";


export async function markFavorites(req, res) {
    try{
        const user_id = req.user.id;
        const { listing_id } = req.params;

        const listing = await getListingById(listing_id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (Number(listing.user_id) === Number(user_id)) {
            return res.status(400).json({ message: "You cannot save your own listing" });
        }

        const result = await addFavorite(user_id, listing_id);

        if (result) {
            try {
                const favoritingUser = await findUserById(user_id);
                const favoritingUserName = favoritingUser?.name || "Someone";
                const listingTitle = listing.title || null;
                const message = listingTitle 
                    ? `${favoritingUserName} favorited your listing "${listingTitle}".`
                    : `${favoritingUserName} favorited your listing.`;
                const io = getIO(req);
                const notif = await createNotification(
                    listing.user_id,
                    "listing_favorited",
                    message,
                    {
                        listing_id,
                        listing_title: listingTitle,
                        favorited_by: user_id,
                        favorited_user_name: favoritingUser?.name || null,
                        favorited_user_id: favoritingUser?.id || user_id,
                    }
                );
                if (io) {
                    sendNotification(io, listing.user_id, notif);
                }
            } catch (innerErr) {
                console.error("Failed to create favorite notification:", innerErr);
            }
        }

        console.log("Listing mark as favorite successfully");
        res.json({ message: result ? "Listing added to favorites" : "Already in favorites" });
    }catch(err){
        console.log(`markFavorites error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of markFavorites function

export async function unmarkFavorite(req, res) {
    try{
        const user_id = req.user.id;
        const { listing_id } = req.params;

        const result = await removeFavorite(user_id, listing_id);

        console.log("Favorite listing removed successfully");
        res.json({ message: result ? "Listing removed from favorites" : "Favorite did not exist" });
    }catch(err){
        console.log(`unmarkFavorite error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of unmarkFavorite function

export async function getFavorites(req, res) {
    try{
        const user_id = req.user.id;
        const favorites = await getUserFavorites(user_id);

        console.log("Favorites fetched successfully");
        res.json({ message: "Fetched favorites successfully", favorites: favorites });
    }catch(err){
        console.log(`getFavorites error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of getFavorites function

