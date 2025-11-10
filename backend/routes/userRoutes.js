import express from "express";
import { getUserProfile } from "../controllers/userController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

//User routes
router.get("/profile". verifyToken, getUserProfile);


export default router;
