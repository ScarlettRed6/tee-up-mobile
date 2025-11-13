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

export async function fetchUserListings(userId){
    const response = await api.get(`/listings?user_d=${userId}`);
    return response.data.result;
}
