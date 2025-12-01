import { uploadToCloudinary } from "../config/cloudinary.js";
import { getUsersWhoFavorited } from "../models/favoritesModel.js";
import { insertListing, getAllListings, getListingById, updateListing, deleteListing, updateListingStatus, getAllListingsExceptOwn } 
from "../models/listingsModel.js";
import { createNotification } from "../utils/notifications.js";
import { sendNotification } from "../utils/socketHandler.js";
import { getIO } from "../utils/getIo.js";
import { getFollowersForUser } from "../models/followerModel.js";
import { findUserById } from "../models/userModel.js";


export async function createListing(req, res) {

    const user_id = req.user.id;
    const io = getIO(req);
    
    // Verify user_id is present
    if (!user_id) {
        return res.status(401).json({ error: "User ID not found in token. Please log in again." });
    }

    const { title, description, category, brand, flex, hand, condition, price, status, location } = req.body;
    
    try{

        let photosUrls = [];
        if (req.files){
            for (const file of req.files){
                const uploaded = await uploadToCloudinary(file.buffer, "listings");
                photosUrls.push(uploaded.secure_url);
            }
        }


        console.log("Creating listing for user_id:", user_id);
        console.log("Listing data:", { title, category, condition, price });
        console.log("Photos URLs to save:", photosUrls);
        
        const newListing = await insertListing(user_id, title, description, category, brand, flex, hand, condition, price, status, photosUrls, location);
        
        // Ensure photos are parsed correctly
        if (newListing.photos && typeof newListing.photos === 'string') {
            try {
                newListing.photos = JSON.parse(newListing.photos);
            } catch (e) {
                console.error("Error parsing photos:", e);
                newListing.photos = [];
            }
        }
        
        console.log("Listing created successfully with ID:", newListing.listing_id, "for user_id:", newListing.user_id);
        console.log("Returned photos:", newListing.photos);
        
        try {
            const followers = await getFollowersForUser(user_id);
            if (followers.length > 0) {
                const seller = await findUserById(user_id);
                const sellerName = seller?.name || 'Someone';
                const listingTitle = newListing.title || title;
                const message = listingTitle 
                    ? `${sellerName} posted a new listing "${listingTitle}"`
                    : `${sellerName} posted a new listing`;
                for (const follower of followers) {
                    const notif = await createNotification(
                        follower.follower_id,
                        "followed_new_listing",
                        message,
                        {
                            listing_id: newListing.listing_id,
                            listing_title: listingTitle,
                            seller_id: user_id,
                            seller_name: sellerName,
                        }
                    );
                    if (io) {
                        sendNotification(io, follower.follower_id, notif);
                    }
                }
            }
        } catch (notifyError) {
            console.error("Failed to notify followers about new listing:", notifyError.message);
        }

        res.status(201).json({ message: "New listing added successfully!", listing: newListing });
    }catch(err){
        console.error("Error creating listing:", err);
        res.status(500).json({ error: err.message });
    }
}

export async function getAllListingItems(req, res) {
    try{
        const { category, user_id, sort, status, search, min_price, max_price, condition, flex, hand, } = req.query;

        console.log('Received query params:', { category, search, min_price, max_price, condition, flex, hand, status });
        
        const filters = {};
        if (category) {
            filters.category = category.trim();
            console.log('Setting category filter:', filters.category);
        }
        if (user_id) filters.user_id = user_id;
        if (status) filters.status = status;
        if (condition) filters.condition = condition;
        if (search) filters.search = search;
        if (flex) filters.flex = flex;
        if (hand) filters.hand = hand;

        if (min_price !== undefined && min_price !== null && min_price !== '') {
            const parsedMin = parseFloat(min_price);
            if (!Number.isNaN(parsedMin) && parsedMin >= 0) {
                filters.min_price = parsedMin;
            }
        }

        if (max_price !== undefined && max_price !== null && max_price !== '') {
            const parsedMax = parseFloat(max_price);
            if (!Number.isNaN(parsedMax) && parsedMax >= 0) {
                filters.max_price = parsedMax;
            }
        }

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
        let { title, description, category, brand, flex, hand, condition, price, status, existingPhotos, location  } = req.body;

        const listing = await getListingById(id);
        if(!listing) return res.status(404).json({ message: "Listing not found!" });
        
        if(listing.user_id !== userId) return res.status(403).json({ message: "Unauthorized: you don't own this listing!" });

        // Normalize status to lowercase to match database constraint
        // Allowed values: "available", "pending", "sold"
        if (status) {
            status = status.toLowerCase();
            const allowed = ["available", "pending", "sold"];
            if (!allowed.includes(status)) {
                // If invalid status, keep the existing status or default to "available"
                status = listing.status || "available";
            }
        } else {
            // If no status provided, keep the existing status
            status = listing.status || "available";
        }

        // Parse existingPhotos if it's a JSON string (from FormData)
        if (typeof existingPhotos === 'string') {
            try {
                existingPhotos = JSON.parse(existingPhotos);
            } catch (e) {
                // If parsing fails, treat as single value or empty
                existingPhotos = existingPhotos ? [existingPhotos] : [];
            }
        }
        
        let photosUrls = existingPhotos || listing.photos || [];
        
        // Ensure photosUrls is an array
        if (!Array.isArray(photosUrls)) {
            photosUrls = photosUrls ? [photosUrls] : [];
        }

        if(req.files && req.files.length > 0){
            for(const file of req.files){
                const uploaded = await uploadToCloudinary(file.buffer, "listings");
                photosUrls.push(uploaded.secure_url);
            }
        }

        const updatedListing = await updateListing(id, title, description, category, brand, flex, hand, condition, price, status, photosUrls, location);
        
        // Ensure photos are parsed correctly
        if (updatedListing.photos && typeof updatedListing.photos === 'string') {
            try {
                updatedListing.photos = JSON.parse(updatedListing.photos);
            } catch (e) {
                console.error("Error parsing photos:", e);
                updatedListing.photos = [];
            }
        }

        res.status(200).json({ message: "Listing updated successfully!",  listing: updatedListing});
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

export async function changeListingStatus(req, res) {
    try{
        const user_id = req.user.id;
        const { listing_id } = req.params;
        const { status } = req.body;
        const io = getIO(req);

        //Check if passing the right status value
        const allowed = ["available", "pending", "sold"];
        if(!allowed.includes(status)){
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedListing = await updateListingStatus(listing_id, user_id, status);
        if(!updatedListing){
            return res.status(403).json({ message: "Not allowed, you do not own this listing" });
        }

        //Check if item is sold then send notifications to users who favorited the listing
        if(status === "sold" || status === "pending" || status === "available"){
            const users = await getUsersWhoFavorited(listing_id);
            if (users.length > 0) {
                const seller = await findUserById(user_id);
                const listingTitle = updatedListing?.title || updatedListing?.listing_title || "Listing";
                const sellerName = seller?.name || "Seller";
                const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

                for(const u of users){
                    const notif = await createNotification(
                        u.user_id,
                        "favorite_status_changed",
                        `${sellerName} has marked the listing "${listingTitle}" as ${statusLabel}.`,
                        { 
                            listing_id,
                            listing_title: listingTitle,
                            seller_name: sellerName,
                            status: statusLabel
                        }
                    );
                    sendNotification(io, u.user_id, notif);
                }
            }
        }

        console.log("Listings status updated successfully");
        res.json({ message: "Listing status updated", listing: updatedListing });
    }catch(err){
        console.log(`changeListingStatus error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of changeListingStatus function

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
}//End of deleteListingItem function

export async function getRecommendations(req, res) {
    const userId = req.user.id;
    const { preferredCategory, preferredBrand, preferredPrice } = req.query;

    try{
        const listings = await getAllListingsExceptOwn(userId);

        const scoredListings = listings.map((listing) => {
            let score = 0;

            if (listing.category === preferredCategory){
                score += 3;
            }

            if (listing.brand === preferredBrand){
                score += 2;
            }

            if (preferredPrice){
                const diff = Math.abs(Number(listing.price) - Number(preferredPrice));
                if (diff < 500) score += 2;
                else if (diff < 1000) score += 1;
            }

            return { ...listing, score};
        });

        scoredListings.sort((a, b) => b.score - a.score);

        res.json({ success: true, recommendations: scoredListings.slice(0, 10) });
    }catch(err){
        console.log(`getRecommendations error: ${err}`);
        res.status(500).json({ error: `SERVER ERROR GENERATING RECOMMENDATIONS ${err.message}` });
    }
}//End of getRecommendations function


