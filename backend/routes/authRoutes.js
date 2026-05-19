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
        verifyEmailOtp,
        googleAuthSuccess } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import passport from "../config/passport.js";

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

// 1. Click target: Front-end triggers this route to send the user to Google's login page
router.get("/google", passport.authenticate("google", { session: false, scope: ["profile", "email"] }));

// 2. Landing pad: Google sends the user back here with an authentication token
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login?error=oauth_failed" }),
    googleAuthSuccess
);

export default router;
