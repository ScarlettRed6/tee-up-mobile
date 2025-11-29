import express from "express";
import { rateUser, getRatings, getRatingSummary } from "../controllers/userRatingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:rated_user_id", verifyToken, rateUser);
router.get("/:user_id", getRatings);
router.get("/:user_id/summary", getRatingSummary);

export default router;