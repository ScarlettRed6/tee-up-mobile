import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import listingsRoutes from "./routes/listingsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import followerRoutes from "./routes/followerRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:5173',
    'https://tee-up.com'
];

//Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            console.log("[APP] Not allowed by CORS");
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/following", followerRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin", adminRoutes);

export default app;
