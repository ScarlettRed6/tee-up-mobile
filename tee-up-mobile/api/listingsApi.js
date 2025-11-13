import api from "./axiosInstance.js"

export const createListing = async (listingData) => {
    const res = await api.post("/listings", listingData);
    return res.data;
};

export const getAllListings= async () => {
    const res = await api.get("/listings");
    return res.data.result;
};

