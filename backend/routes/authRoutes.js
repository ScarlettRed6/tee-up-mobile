import express from "express";
import { register, login, refreshToken, googleAuth } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/google", googleAuth);

export default router;
