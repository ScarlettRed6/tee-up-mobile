import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import listingsRoutes from "./routes/listingsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/chat", chatRoutes);

export default app;
