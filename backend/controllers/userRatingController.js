import { addOrUpdateRating, getUserRatings, getUserRatingSummary } from "../models/userRatingModel.js";
import { createNotification } from "../utils/notifications.js";
import { sendNotification } from "../utils/socketHandler.js";

export async function rateUser(req, res) {
    try{
        const rater_user_id = req.user.id;
        const { rated_user_id } = req.params;
        const { rating, review } = req.body;
        const io = req.app.get("io");

        //Check if user is checking themselve , should not happen
        if(rater_user_id == rated_user_id){
            return res.status(400).json({ message: "You cannot rate yourself" });
        }

        //Check rating value
        if(!rating || rating < 1 || rating > 5){
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        //Query the rating
        const ratingData = await addOrUpdateRating(rated_user_id, rater_user_id, rating, review);

        //After rating, sends a notification to the user who was rated
        if (io) {
            const notif = await createNotification(rated_user_id, "rating_received", `You received a new rating from a user.`, { rating });
            sendNotification(io, rated_user_id, notif);
        }

        console.log("User rated successfully");
        res.json({ message: "Rating submitted successfully", data: ratingData });
    }catch(err){
        console.log(`rateUser error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of rateUser function

export async function getRatings(req, res) {
    try{
        const { user_id } = req.params;
        const ratings = await getUserRatings(user_id);

        res.json({message: "Fetched ratings successfully", ratings: ratings });
    }catch(err){
        console.log(`getRatings error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of getRatings function

export async function getRatingSummary(req, res) {
    try{
        const { user_id } = req.params;
        const summary = await getUserRatingSummary(user_id);

        res.json({ average_rating: summary.average_rating, total_raters: summary.total_raters });
    }catch(err){
        console.log(`getRatingSummary error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of getRatingSummary function
