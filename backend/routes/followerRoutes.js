import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { followUser, unfollowUser, getFollowers, getFollowingStatus } from "../controllers/followerController.js";

const router = express.Router();

router.post("/follow/:userIdToFollow", verifyToken, followUser);
router.delete("/unfollow/:userIdToUnfollow", verifyToken, unfollowUser);
router.get("/followers", verifyToken, getFollowers);
router.get("/followers/:userId", verifyToken, getFollowers);
router.get("/status/:userId", verifyToken, getFollowingStatus);

export default router;
