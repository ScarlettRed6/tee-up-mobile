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
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// ID-token sign-in (mobile app only — web uses GET /google redirect below)
router.post("/google", googleAuth);

router.get("/google/oauth-info", (req, res) => {
    const port = process.env.PORT || 5000;
    const redirectUri =
        process.env.GOOGLE_CALLBACK_URL ||
        `http://localhost:${port}/api/auth/google/callback`;
    const alternateRedirectUri = `http://localhost:${port}/auth/google/callback`;
    res.json({
        passportClientId: process.env.GOOGLE_CLIENT_ID,
        passportRedirectUri: redirectUri,
        alternateRedirectUri,
        redirectUrisToRegister: [redirectUri, alternateRedirectUri],
        googleCloudCredentialsUrl:
            "https://console.cloud.google.com/apis/credentials",
        setupSteps: [
            "Open Google Cloud Console → APIs & Services → Credentials.",
            `Open OAuth client whose Client ID is EXACTLY: ${process.env.GOOGLE_CLIENT_ID || "(GOOGLE_CLIENT_ID)"}.`,
            "Under Authorized redirect URIs (NOT JavaScript origins), add BOTH lines below.",
            "Save, wait 1–2 minutes.",
            "OAuth consent screen → Test users: add naguitanthony@gmail.com if app is in Testing.",
        ],
    });
});

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
router.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
        if (err) {
            console.error("[Google OAuth] callback error:", err);
            const msg = encodeURIComponent(err.message || "Google sign-in failed");
            return res.redirect(`${FRONTEND_URL}/?auth=login&error=${msg}`);
        }
        if (!user) {
            const reason =
                info?.message ||
                "Google sign-in failed. If the app is in Testing mode, ask Will to add your Gmail as a test user.";
            console.error("[Google OAuth] auth failed:", reason);
            return res.redirect(
                `${FRONTEND_URL}/?auth=login&error=${encodeURIComponent(reason)}`
            );
        }
        req.user = user;
        next();
    })(req, res, next);
}, googleAuthSuccess);

export default router;
