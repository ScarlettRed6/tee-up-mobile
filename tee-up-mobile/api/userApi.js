import api from "./axiosInstance.js";

export const getUserProfile = async () => {
    const res = await api.get("/user/profile");
    return res.data;
};

export const getUserById = async (userId) => {
    const res = await api.get(`/user/${userId}`);
    return res.data;
};

export const updateUserProfile = async (profileData, profileImage = null) => {
    const formData = new FormData();
    
    // Add profile fields
    if (profileData.name) {
        formData.append('name', profileData.name);
    }
    if (profileData.email) {
        formData.append('email', profileData.email);
    }
    
    // Add profile image if provided
    if (profileImage && profileImage.uri) {
        // Only add if it's a new image (not a URL)
        if (!profileImage.uri.startsWith('http')) {
            formData.append('profile_image', {
                uri: profileImage.uri,
                type: profileImage.type || 'image/jpeg',
                name: profileImage.name || 'profile.jpg'
            });
        }
    }
    
    const res = await api.put("/user/update", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};