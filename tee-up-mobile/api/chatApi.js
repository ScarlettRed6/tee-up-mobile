import api from "./axiosInstance.js";

// Get all conversations for the current user
export const getConversations = async () => {
    const res = await api.get("/chat/conversations");
    return res.data.conversations;
};

// Get messages for a specific conversation
export const getMessages = async (conversationId) => {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`);
    return {
        messages: res.data.messages,
        conversation: res.data.conversation
    };
};

// Find existing conversation (without creating)
export const findConversation = async (sellerId, listingId) => {
    const res = await api.post("/chat/conversations/find", {
        sellerId,
        listingId
    });
    return res.data.conversation; // Returns null if not found
};

// Find or create a conversation
export const findOrCreateConversation = async (sellerId, listingId) => {
    const res = await api.post("/chat/conversations/find-or-create", {
        sellerId,
        listingId
    });
    return res.data.conversation;
};

export const uploadChatImage = async (formData) => {
    const res = await api.post("/chat/upload-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

