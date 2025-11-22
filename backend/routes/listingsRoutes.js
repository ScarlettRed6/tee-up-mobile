import express from "express";
import upload from "../middleware/upload.js";
import { createListing, getAllListingItems, getListingItemById, updateListingItem, deleteListingItem } 
from "../controllers/listingsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllListingItems);
router.get("/:id", getListingItemById);

//VERY IMPORTANT ROUTE MUST PROTEC!
router.post("/", verifyToken, upload.array("photos", 5), createListing);
router.put("/:id", verifyToken, upload.array("photos", 5), updateListingItem);
router.delete("/:id", verifyToken, deleteListingItem);


export default router;
