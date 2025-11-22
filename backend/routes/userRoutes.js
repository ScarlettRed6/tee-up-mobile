import express from "express";
import { getUserProfile, getUserById, updateUserProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

//User routes
router.get("/profile", verifyToken, getUserProfile);

//For the public route
router.get("/:id", getUserById);

router.put("/update", verifyToken, upload.single("profile_image"), updateUserProfile);


export default router;
