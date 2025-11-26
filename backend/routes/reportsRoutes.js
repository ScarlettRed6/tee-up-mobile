import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { reportListing } from "../controllers/reportsController.js";

const router = express.Router();

router.post("/listing/:listing_id", verifyToken, reportListing);

export default router;