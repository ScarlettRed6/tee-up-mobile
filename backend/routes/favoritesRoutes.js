import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { markFavorites, unmarkFavorite, getFavorites } from "../controllers/favoritesController.js";

const router = express.Router();

router.post("/:listing_id", verifyToken, markFavorites);
router.delete("/:listing_id", verifyToken, unmarkFavorite);
router.get("/", verifyToken, getFavorites);

export default router;
