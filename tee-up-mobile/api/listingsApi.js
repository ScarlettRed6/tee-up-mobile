import api from "./axiosInstance.js"

export const createListing = async (listingData, photos = []) => {
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
    
    const res = await api.post("/listings", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data.listing;
};

export async function fetchListings(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/listings?${params}`);
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

export const updateListing = async (listingId, listingData, photos = []) => {
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
    
    const res = await api.put(`/listings/${listingId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data.listing;
};
