import express from "express";
import { getUserProfile, getUserById } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

//User routes
router.get("/profile", verifyToken, getUserProfile);

//For the public route
router.get("/:id", getUserById);


export default router;
