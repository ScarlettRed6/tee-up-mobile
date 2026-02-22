import express from "express";
import upload from "../middleware/upload.js";
import { 
    createListing, 
    getAllListingItems, 
    getListingItemById, 
    updateListingItem, 
    deleteListingItem, 
    changeListingStatus, 
    getRecommendations,
    adminGetAllListings,
    adminUpdateListingStatus,
    adminDeleteListing,
    adminViewListing
} from "../controllers/listingsController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/recommendations", verifyToken, getRecommendations);
router.get("/", getAllListingItems);
router.get("/:id", getListingItemById);

//VERY IMPORTANT ROUTE MUST PROTEC!
router.post("/", verifyToken, upload.array("photos", 5), createListing);
router.put("/:id", verifyToken, upload.array("photos", 5), updateListingItem);
router.delete("/:id", verifyToken, deleteListingItem);
router.patch("/:listing_id/status", verifyToken, changeListingStatus);

//Admin routes
router.get("/admin/all", verifyToken, verifyAdmin, adminGetAllListings);
router.put("/admin/status/:id", verifyToken, verifyAdmin, adminUpdateListingStatus);
router.get("/admin/listing/:id", verifyToken, verifyAdmin, adminViewListing);
router.delete("/admin/delete/:id", verifyToken, verifyAdmin, adminDeleteListing);

export default router;
