import express from "express";
import { createListing, getAllListingItems, getListingItemById, updateListingItem, deleteListingItem } 
from "../controllers/listingsController.js";

const router = express.Router();

router.post("/", createListing);
router.get("/", getAllListingItems);
router.get("/:id", getListingItemById);
router.put("/:id", updateListingItem);
router.delete("/:id", deleteListingItem);


export default router;
