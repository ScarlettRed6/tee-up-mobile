import jwt from "jsonwebtoken";
import { saveSentMessage } from "../controllers/chatController";


export function initSocketHandlers(io){
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        }catch(err){
            console.log("SOCKETHANDLER, ERROR: ", err);
            next(new Error("Unauthorized access to chats"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected: ", socket.userId);

        socket.on("join_conversation", ({ conversationId }) => {
            socket.join("room_" + conversationId);
        });

        socket.on("send_message", async ({ conversationId, message }) => {
            try {
                const result = await saveSentMessage(conversationId, socket.userId, message);
                io.to("room_" + conversationId).emit("new_message", result);
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
