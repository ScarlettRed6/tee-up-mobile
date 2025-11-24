import express from "express";
import { register, login, refreshToken, googleAuth, changePassword } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

//Change and forgot password related routes
router.put("/change-password", verifyToken, changePassword);

export default router;
