import express from "express";
import { getConversations, getMessages, findConversationRoute, findOrCreateConversationRoute, uploadImageToChat } from "../controllers/chatController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// All chat routes require authentication
router.get("/conversations", verifyToken, getConversations);
router.get("/conversations/:conversationId/messages", verifyToken, getMessages);
router.post("/conversations/find", verifyToken, findConversationRoute);
router.post("/conversations/find-or-create", verifyToken, findOrCreateConversationRoute);
router.post("/upload-image", verifyToken, upload.single("image"), uploadImageToChat);

export default router;

