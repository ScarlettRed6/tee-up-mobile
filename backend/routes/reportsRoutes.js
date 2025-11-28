import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { reportListing, reportUser } from "../controllers/reportsController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/listing/:listing_id", verifyToken, upload.single("photo"), reportListing);
router.post("/user/:user_id", verifyToken, upload.single("photo"), reportUser);

export default router;