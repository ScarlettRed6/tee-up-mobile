import { addFavorite, removeFavorite, getUserFavorites } from "../models/favoritesModel.js";


export async function markFavorites(req, res) {
    try{
        const user_id = req.user.id;
        const { listing_id } = req.params;

        const result = await addFavorite(user_id, listing_id);

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

