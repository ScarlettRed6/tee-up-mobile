import express from "express";
import { getUserProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

//User routes
router.get("/profile". verifyToken, getUserProfile);


export default router;
