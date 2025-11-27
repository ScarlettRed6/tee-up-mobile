import { createNotification } from "../utils/notifications.js";
import { sendNotification } from "../utils/socketHandler.js";
import { follow, unfollow, getFollowerCount, isFollowingUser } from "../models/followerModel.js";
import { getIO } from "../utils/getIo.js";
import { findUserById } from "../models/userModel.js";

export async function followUser(req, res) {
    try{
        const follower_id = req.user.id;
        const { userIdToFollow } = req.params;
        const io = getIO(req);

        if(follower_id == userIdToFollow){
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const result = await follow(follower_id, userIdToFollow);
        if(result && result.length > 0){
            try {
                const followerUser = await findUserById(follower_id);
                const followerName = followerUser?.name || followerUser?.username || "Someone";
                const notif = await createNotification(
                    userIdToFollow,
                    "new_follower",
                    `${followerName} just followed you.`,
                    { follower_id, follower_name: followerName }
                );
                sendNotification(io, userIdToFollow, notif);
            } catch (notifyErr) {
                console.error("Failed to notify user of new follower:", notifyErr.message);
            }
        }

        console.log("USER FOLLOWED SUCCESSFULLY");
        const alreadyFollowing = !result || result.length === 0;
        res.json({ message: alreadyFollowing ? "Already following" : "Followed successfully" });
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
        const unfollowed = result && result.length > 0;
        res.json({ message: unfollowed ? "User unfollowed successfully" : "You were not following this user." });
    }catch(err){
        console.log(`unfollowUser error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of unfollowUser function

export async function getFollowers(req, res){
    try{
        const targetUserId = req.params.userId || req.query.userId || req.user.id;
        const result = await getFollowerCount(targetUserId);
        res.json({ message: "Fetched number of followers successfully", followers: result });
    }catch(err){
        console.log(`getFollower error: ${err}`);
        res.status(500).json({ error: err.message });
    } 
}//End of getFollowers function

export async function getFollowingStatus(req, res){
    try{
        const follower_id = req.user.id;
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        if (Number(userId) === Number(follower_id)) {
            return res.json({ isFollowing: false });
        }

        const isFollowing = await isFollowingUser(follower_id, userId);
        res.json({ isFollowing });
    }catch(err){
        console.log(`getFollowingStatus error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}


