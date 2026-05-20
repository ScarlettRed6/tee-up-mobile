//Important
import app from "./app.js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import logger from "./utils/eventLogger.js"
import { initSocketHandlers } from "./utils/socketHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

initSocketHandlers(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.emit("log", `Server started successfully! Running on Port ${PORT}`);
});

/* app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.emit("log", `Server started successfully! Running on Port ${PORT}`);
}); */

