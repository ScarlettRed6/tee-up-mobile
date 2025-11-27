import jwt from "jsonwebtoken";
import { saveSentMessage } from "../controllers/chatController.js";
import { getOtherParticipant } from "../models/chatModel.js";
import { createNotification } from "./notifications.js";

export function sendNotification(io, userId, notification){
    io.to("user_" + userId).emit("notification", notification);
}

export function initSocketHandlers(io){
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        console.log("Socket authentication attempt, token present:", !!token);

        try{
            if (!token) {
                console.error("No token provided in socket handshake");
                return next(new Error("No token provided"));
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            console.log("Socket authenticated, userId set to:", socket.userId, "type:", typeof socket.userId);
            next();
        }catch(err){
            console.log("SOCKETHANDLER, ERROR: ", err);
            next(new Error("Unauthorized access to chats"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected: ", socket.userId);

        socket.join("user_", socket.userId);

        socket.on("join_conversation", ({ conversationId }) => {
            socket.join("room_" + conversationId);
        });

        socket.on("send_message", async ({ conversationId, message, image_url }) => {
            try {
                console.log("Socket send_message received:", {
                    conversationId,
                    socketUserId: socket.userId,
                    message: message.substring(0, 50)
                });
                
                if (!socket.userId) {
                    console.error("ERROR: socket.userId is not set!");
                    socket.emit("error_message", { message: "User not authenticated" });
                    return;
                }
                
                if (!message && !image_url) {
                    socket.emit("error_message", { message: "Cannot send empty message" });
                    return;
                }
                
                const result = await saveSentMessage(conversationId, socket.userId, message || null, image_url || null);
                console.log("Message saved with sender_id:", result.sender_id);
                io.to("room_" + conversationId).emit("new_message", result);

                const otherUser = await getOtherParticipant(conversationId, socket.userId);
                if(otherUser){
                    const notif = await createNotification(otherUser, "new_message", "You have a new message", { conversationId });
                    sendNotification(io, otherUser, notif);
                }

            } catch (err) {
                console.error("Error sending message:", err.message);
                socket.emit("error_message", { message: "Message not sent" });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected: ", socket.userId);
        });

    });
}//End of initSocketHandlers function
