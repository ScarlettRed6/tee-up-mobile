import { insertListing, getAllListings, getListingById, updateListing, deleteListing } 
from "../models/listingsModel.js";


export async function createListing(req, res) {
    const { user_id, title, description, category, brand, condition, price, status, photos }
    = req.body;
    try{
        const newListing = await insertListing(user_id, title, description, category, brand, condition, price, status, photos);
        
        res.status(201).json({ message: "New listing added successfully!", listing: newListing });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

export async function getAllListingItems(req, res) {
    try{
        const result = await getAllListings();
        res.status(200).json({ message: "Fetched Listings successfully!", result });
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
        const { title, description, category, brand, condition, price, status, photos }
        = req.body;

        const updatedListing = await updateListing(id, title, description, category, brand, condition, price, status, photos);
        if (!updatedListing) return res.status(404).json({ message: "Listing item not found!, CAN'T UPDATE AN ITEM THAT DOESN'T EXISTS!" });

        res.status(200).json({ message: "Listing updated successfully!",  listing: updatedListing});
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

export async function deleteListingItem(req, res) {
    try{

    }catch(err){
        res.status(500).json({ error: err.message });
    }
}
