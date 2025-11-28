import api from "./axiosInstance.js";

export const reportListing = async (listingId, reason, photo = null) => {
    const formData = new FormData();
    formData.append('reason', reason);
    
    if (photo && photo.uri) {
        // Only add if it's a new image (not a URL)
        if (!photo.uri.startsWith('http')) {
            formData.append('photo', {
                uri: photo.uri,
                type: photo.type || 'image/jpeg',
                name: photo.name || 'report_photo.jpg'
            });
        }
    }
    
    const res = await api.post(`/reports/listing/${listingId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const reportUser = async (userId, reason, photo = null) => {
    const formData = new FormData();
    formData.append('reason', reason);
    
    if (photo && photo.uri) {
        // Only add if it's a new image (not a URL)
        if (!photo.uri.startsWith('http')) {
            formData.append('photo', {
                uri: photo.uri,
                type: photo.type || 'image/jpeg',
                name: photo.name || 'report_photo.jpg'
            });
        }
    }
    
    const res = await api.post(`/reports/user/${userId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

