import express from "express";
import { 
    getUserProfile, 
    getUserById, 
    updateUserProfile,
    suspendUser,
    unsuspendUser,
    deleteUser,
    adminUpdateUser,
    adminGetUserById,
    getUsers,
    getAllActiveUsersCount,
    getTotalUserCount,
    getTopSellersList,
    getSuspensionLogs
} from "../controllers/userController.js";
import { verifyToken, verifyAdmin, verifySuperAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

//User routes - specific routes must come before parameterized routes
router.get("/profile", verifyToken, getUserProfile);
router.put("/update", verifyToken, upload.single("profile_image"), updateUserProfile);

//For the public route - must be last to avoid catching other routes
router.get("/:id", getUserById);

//ADMIN ROUTES - user manangement
router.get("/admin/users", verifyAdmin, getUsers);
router.get("/admin/suspension-logs", verifyAdmin, getSuspensionLogs);
router.get("/admin/user/:id", verifyAdmin, adminGetUserById);
router.get("/admin/profile", verifyToken, verifyAdmin, getUserProfile);
router.get("/admin/active", verifyAdmin, getAllActiveUsersCount);
router.get("/admin/total", verifyAdmin, getTotalUserCount);
router.get("/admin/top-sellers", verifyAdmin, getTopSellersList);

router.put("/admin/update/:id", verifyAdmin, upload.single("profile_image"), adminUpdateUser);
router.post("/admin/suspend/:id", verifyAdmin, suspendUser);
router.post("/admin/unsuspend/:id", verifyAdmin, unsuspendUser);
router.delete("/admin/delete/:id", verifyAdmin, deleteUser);

export default router;
