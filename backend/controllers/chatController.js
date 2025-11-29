import { 
    storeMessage, 
    findOrCreateConversation,
    findConversation,
    getConversationsForUser, 
    getMessagesForConversation,
    getConversationById 
} from "../models/chatModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export async function saveSentMessage(conversation_id, senderId, message, image_url){
    try{
        const result = await storeMessage(conversation_id, senderId, message, image_url);
        return result;
    }catch(err){
        console.log('CHATCONTROLLER, ERROR: ', err.message);
        throw new Error("Error saving message");
    }
}

// Get all conversations for the current user
export async function getConversations(req, res){
    try{
        const userId = req.user.id;
        const conversations = await getConversationsForUser(userId);
        const unreadCount = 0;
        res.status(200).json({ message: "Conversations fetched successfully", conversations, unreadCount });
    }catch(err){
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: err.message });
    }
}

// Get messages for a specific conversation
export async function getMessages(req, res){
    try{
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify user is part of this conversation
        const conversation = await getConversationById(conversationId);
        if(!conversation){
            return res.status(404).json({ message: "Conversation not found" });
        }

        if(conversation.buyer_id !== userId && conversation.seller_id !== userId){
            return res.status(403).json({ message: "Unauthorized: You are not part of this conversation" });
        }

        const messages = await getMessagesForConversation(conversationId);
        res.status(200).json({ message: "Messages fetched successfully", messages, conversation });
    }catch(err){
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: err.message });
    }
}

// Find existing conversation (without creating)
export async function findConversationRoute(req, res){
    try{
        const userId = req.user.id; // Current user (buyer)
        const { sellerId, listingId } = req.body;

        if(!sellerId || !listingId){
            return res.status(400).json({ message: "sellerId and listingId are required" });
        }

        if(userId === sellerId){
            return res.status(400).json({ message: "Cannot create conversation with yourself" });
        }

        const conversation = await findConversation(userId, sellerId, listingId);
        res.status(200).json({ message: "Conversation check completed", conversation });
    }catch(err){
        console.error("Error finding conversation:", err);
        res.status(500).json({ error: err.message });
    }
}

// Find or create a conversation
export async function findOrCreateConversationRoute(req, res){
    try{
        const userId = req.user.id; // Current user (buyer)
        const { sellerId, listingId } = req.body;

        if(!sellerId || !listingId){
            return res.status(400).json({ message: "sellerId and listingId are required" });
        }

        if(userId === sellerId){
            return res.status(400).json({ message: "Cannot create conversation with yourself" });
        }

        const conversation = await findOrCreateConversation(userId, sellerId, listingId);
        res.status(200).json({ message: "Conversation found/created successfully", conversation });
    }catch(err){
        console.error("Error finding/creating conversation:", err);
        res.status(500).json({ error: err.message });
    }
}//End of findOrCreateConversationRoute function

export async function uploadImageToChat(req, res) {
    try{
        const result = await uploadToCloudinary(req.file.buffer, "chat_images");

        res.json({ image_url: result.secure_url });
    }catch(err){
        console.log("uploadImageToChat error: ", err);
        res.status(500).json({ message: err.message });
    }
}//End of uploadImageToChat function

