import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import { 
    reportListing, 
    reportUser,
    getAdminReports,
    reviewReport,
    adminGetPendingReportsCount,
    adminGetCompletedReportsCount
} from "../controllers/reportsController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/listing/:listing_id", verifyToken, upload.single("photo"), reportListing);
router.post("/user/:user_id", verifyToken, upload.single("photo"), reportUser);

//Admin report routes
router.get("/admin/all", verifyToken, verifyAdmin, getAdminReports);
router.get("/admin/pending", verifyAdmin, adminGetPendingReportsCount);
router.get("/admin/completed", verifyAdmin, adminGetCompletedReportsCount);

router.put("/admin/review/:report_id", verifyToken, verifyAdmin, reviewReport);

export default router;