import { createNotification } from "../utils/notifications.js";
import { sendNotification } from "../utils/socketHandler.js";
import { follow, unfollow, getFollowerCount } from "../models/followerModel.js";
import { getIO } from "../utils/getIo.js";

export async function followUser(req, res) {
    try{
        const follower_id = req.user.id;
        const { userIdToFollow } = req.params;
        const io = getIO(req);

        if(follower_id == userIdToFollow){
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const result = await follow(follower_id, userIdToFollow);
        if(result > 0){
            const notif = await createNotification(userIdToFollow, "new_follower", "Someone followed you.", { follower_id });
            sendNotification(io, userIdToFollow, notif);
        }

        console.log("USER FOLLOWED SUCCESSFULLY");
        res.json({ message: result ? "Followed successfully" : "Already following" });
    }catch(err){
        console.log(`followUser error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of followUser function

export async function unfollowUser(req, res) {
    try{
        const follower_id = req.user.id;
        const { userIdToUnfollow } = req.params;

        const result = await unfollow(follower_id, userIdToUnfollow);

        console.log("USER UNFOLLOWED SUCCESSFULLY");
        res.json({ message: result > 0 ? "User unfollowed successfully" : "You were not following this user." });
    }catch(err){
        console.log(`unfollowUser error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of unfollowUser function

export async function getFollowers(req, res){
    try{
        const user_id = req.user.id;

        const result = await getFollowerCount(user_id);

        res.json({ message: "Fetched number of followers successfully", followers: result });
    }catch(err){
        console.log(`getFollower error: ${err}`);
        res.status(500).json({ error: err.message });
    } 
}//End of getFollowers function


