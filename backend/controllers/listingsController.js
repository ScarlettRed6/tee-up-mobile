import { insertListing, getAllListings, getListingById, updateListing, deleteListing } 
from "../models/listingsModel.js";


export async function createListing(req, res) {

    const user_id = req.user.id;
    
    // Verify user_id is present
    if (!user_id) {
        return res.status(401).json({ error: "User ID not found in token. Please log in again." });
    }

    const { title, description, category, brand, condition, price, status, photos }
    = req.body;
    
    try{
        console.log("Creating listing for user_id:", user_id);
        console.log("Listing data:", { title, category, condition, price });
        
        const newListing = await insertListing(user_id, title, description, category, brand, condition, price, status, photos);
        
        console.log("Listing created successfully with ID:", newListing.listing_id, "for user_id:", newListing.user_id);
        
        res.status(201).json({ message: "New listing added successfully!", listing: newListing });
    }catch(err){
        console.error("Error creating listing:", err);
        res.status(500).json({ error: err.message });
    }
}

export async function getAllListingItems(req, res) {
    try{
        const { category, user_id, sort, status } = req.query;

        const filters = {};
        if (category) filters.category = category;
        if (user_id) filters.user_id = user_id;
        if (status) filters.status = status;

        const result = await getAllListings(filters, sort);
        res.status(200).json({ message: "Fetch listings successfully!", result });

    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

export async function getListingItemById(req, res) {
    try{
        const { id } = req.params;
        const result = await getListingById(id);
        res.status(200).json({ message: "Listing got successfully! idk", result });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

export async function updateListingItem(req, res) {
    try{
        const { id } = req.params;
        const userId = req.user.id;
        const { title, description, category, brand, condition, price, status, photos } = req.body;

        const listing = await getListingById(id);
        if(!listing) return res.status(404).json({ message: "Listing not found!" });
        
        if(listing.user_id !== userId) return res.status(403).json({ message: "Unauthorized: you don't own this listing!" });

        const updatedListing = await updateListing(id, title, description, category, brand, condition, price, status, photos);

        res.status(200).json({ message: "Listing updated successfully!",  listing: updatedListing});
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

export async function deleteListingItem(req, res) {
    try{
        const { id } = req.params;
        const userId = req.user.id;

        const listing = await getListingById(id);
        if(!listing) return res.status(404).json({ message: "Listing not found!" });

        if(listing.user_id !== userId) return res.status(403).json({ message: "Unauthorized: you don't own this listing!" });

        const deletedListing = await deleteListing(id);

        res.status(200).json({ message: "Listing deleted successfully!",  listing: deletedListing});
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}




//Implement later features
/* 
    Flagging of a listing
        - 
*/

