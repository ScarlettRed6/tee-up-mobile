import express from "express";
import { createListing, getAllListingItems, getListingItemById, updateListingItem, deleteListingItem } 
from "../controllers/listingsController.js";

const router = express.Router();

router.get("/", getAllListingItems);
router.get("/:id", getListingItemById);

//VERY IMPORTANT ROUTE MUST PROTEC!
router.post("/", createListing);
router.put("/:id", updateListingItem);
router.delete("/:id", deleteListingItem);


export default router;
