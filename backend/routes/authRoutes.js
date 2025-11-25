import express from "express";
import { 
        register, 
        login, 
        refreshToken, 
        googleAuth, 
        changePassword, 
        sendResetOtp, 
        verifyResetOtp, 
        resetPassword,
        sendEmailVerification,
        verifyEmailOtp } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

//Change and forgot password related routes
router.put("/change-password", verifyToken, changePassword);
router.post("/forget-password", sendResetOtp);
router.post("/verify-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

//Email otp verification routes
router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email-otp", verifyEmailOtp);

export default router;
