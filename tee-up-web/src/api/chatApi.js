import axiosInstance from './axiosInstance';

export const getConversations = async () => {
  const res = await axiosInstance.get('/chat/conversations');
  return res.data;
};

export const getMessages = async (conversationId) => {
  const res = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`);
  return res.data;
};

export const findOrCreateConversation = async (sellerId, listingId) => {
  const res = await axiosInstance.post('/chat/conversations/find-or-create', {
    sellerId,
    listingId,
  });
  return res.data.conversation;
};

