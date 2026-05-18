import api from "./axiosInstance.js"
import {
    LISTING_UPLOAD_TIMEOUT_MS,
    findLikelyCreatedListing,
    isAmbiguousListingSubmitError,
} from "../utils/listingSubmitRecovery.js";

export const createListing = async (listingData, photos = [], options = {}) => {
    const formData = new FormData();
    
    // Add all listing fields to FormData
    formData.append('title', listingData.title);
    formData.append('description', listingData.description);
    formData.append('category', listingData.category);
    formData.append('condition', listingData.condition);
    formData.append('price', listingData.price.toString());
    formData.append('status', listingData.status || 'available');
    
    if (listingData.brand) {
        formData.append('brand', listingData.brand);
    }
    
    if (listingData.flex) {
        formData.append('flex', listingData.flex);
    }
    
    if (listingData.hand) {
        formData.append('hand', listingData.hand);
    }
    
    if (listingData.location) {
        formData.append('location', listingData.location);
    }
    
    // Add photos - photos should be file objects with uri, type, name
    photos.forEach((photo, index) => {
        // Skip if photo is already a URL (from existing listings)
        if (photo.uri && !photo.uri.startsWith('http')) {
            formData.append('photos', {
                uri: photo.uri,
                type: photo.type || 'image/jpeg',
                name: photo.name || `photo_${index}.jpg`
            });
        }
    });
    
    try {
        const res = await api.post("/listings", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: LISTING_UPLOAD_TIMEOUT_MS,
            skipAuthRetry: true,
        });
        const listing = res.data?.listing;
        if (!listing) {
            throw new Error("Server did not return listing data");
        }
        return listing;
    } catch (err) {
        const userId = options.userId;
        if (userId && isAmbiguousListingSubmitError(err)) {
            const recovered = await findLikelyCreatedListing(userId, listingData);
            if (recovered) {
                return recovered;
            }
        }
        throw err;
    }
};

export async function fetchListings(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        // Ensure category is properly encoded
        if (key === 'category' && value !== 'All') {
            params.append(key, value.toString().trim());
        } else if (key !== 'category') {
            params.append(key, value);
        }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/listings?${queryString}` : '/listings';
    console.log('Fetching listings with filters:', filters);
    console.log('API endpoint:', endpoint);
    const response = await api.get(endpoint);
    return response.data.result;
}

export async function fetchListingById(id) {
    const response = await api.get(`/listings/${id}`);
    return response.data.result;
}

export async function fetchUserListings(userId){
    console.log('fetchUserListings called with userId:', userId);
    const response = await api.get(`/listings?user_id=${userId}`);
    console.log('fetchUserListings response:', response.data);
    return response.data.result || [];
}

export async function updateListingStatus(listingId, status){
    const response = await api.patch(`/listings/${listingId}/status`, { status });
    return response.data.listing;
}

export const updateListing = async (listingId, listingData, photos = [], options = {}) => {
    const formData = new FormData();
    
    // Add all listing fields to FormData
    formData.append('title', listingData.title);
    formData.append('description', listingData.description);
    formData.append('category', listingData.category);
    formData.append('condition', listingData.condition);
    formData.append('price', listingData.price.toString());
    formData.append('status', listingData.status || 'available');
    
    if (listingData.brand) {
        formData.append('brand', listingData.brand);
    }
    
    if (listingData.flex) {
        formData.append('flex', listingData.flex);
    }
    
    if (listingData.hand) {
        formData.append('hand', listingData.hand);
    }
    
    if (listingData.location) {
        formData.append('location', listingData.location);
    }
    
    // Separate existing photos (URLs) from new photos (files)
    const existingPhotos = photos
        .filter(photo => photo.isExisting || typeof photo === 'string' || (photo.uri && photo.uri.startsWith('http')))
        .map(photo => {
            if (typeof photo === 'string') return photo;
            return photo.uri || photo;
        });
    
    const newPhotos = photos.filter(photo => 
        photo.uri && !photo.uri.startsWith('http') && !photo.isExisting
    );
    
    // Send existing photos as JSON string (backend will need to parse)
    if (existingPhotos.length > 0) {
        formData.append('existingPhotos', JSON.stringify(existingPhotos));
    }
    
    // Add new photos as files
    newPhotos.forEach((photo, index) => {
        formData.append('photos', {
            uri: photo.uri,
            type: photo.type || 'image/jpeg',
            name: photo.name || `photo_${index}.jpg`
        });
    });
    
    try {
        const res = await api.put(`/listings/${listingId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: LISTING_UPLOAD_TIMEOUT_MS,
            skipAuthRetry: true,
        });
        const listing = res.data?.listing;
        if (!listing) {
            throw new Error("Server did not return listing data");
        }
        return listing;
    } catch (err) {
        const userId = options.userId;
        if (userId && isAmbiguousListingSubmitError(err)) {
            const recovered = await findLikelyCreatedListing(userId, listingData);
            if (recovered && String(recovered.listing_id ?? recovered.id) === String(listingId)) {
                return recovered;
            }
        }
        throw err;
    }
};

/**
 * Fetch personalized recommendations for the current user
 * @param {Object} preferences - User preferences for recommendations
 * @param {string} preferences.preferredCategory - Preferred category (optional)
 * @param {string} preferences.preferredBrand - Preferred brand (optional)
 * @param {number} preferences.preferredPrice - Preferred price range (optional)
 * @returns {Promise<Array>} Array of recommended listings
 */
export async function fetchRecommendations(preferences = {}) {
    const params = new URLSearchParams();
    
    if (preferences.preferredCategory) {
        params.append('preferredCategory', preferences.preferredCategory);
    }
    if (preferences.preferredBrand) {
        params.append('preferredBrand', preferences.preferredBrand);
    }
    if (preferences.preferredPrice) {
        params.append('preferredPrice', preferences.preferredPrice.toString());
    }
    
    const queryString = params.toString();
    const endpoint = queryString 
        ? `/listings/recommendations?${queryString}` 
        : '/listings/recommendations';
    
    console.log('Fetching recommendations with preferences:', preferences);
    console.log('API endpoint:', endpoint);
    
    const response = await api.get(endpoint);
    return response.data.recommendations || [];
}
