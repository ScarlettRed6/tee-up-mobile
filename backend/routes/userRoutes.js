import express from "express";
import { getUserProfile, getUserById, updateUserProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

//User routes - specific routes must come before parameterized routes
router.get("/profile", verifyToken, getUserProfile);
router.put("/update", verifyToken, upload.single("profile_image"), updateUserProfile);

//For the public route - must be last to avoid catching other routes
router.get("/:id", getUserById);


export default router;
