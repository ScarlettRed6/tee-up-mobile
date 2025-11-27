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

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/following", followerRoutes);

export default app;
