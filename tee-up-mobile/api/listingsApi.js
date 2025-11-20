import api from "./axiosInstance.js"

export const createListing = async (listingData) => {
    const res = await api.post("/listings", listingData);
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
