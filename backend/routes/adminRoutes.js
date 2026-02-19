import express from "express";
import { 
    createAdmin,
    getAdmins,
    updateAdminRole,
    getAdminProfile 
} from "../controllers/adminController.js";
import { verifyAdmin, verifySuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifyAdmin, getAdminProfile);

router.post("/create", verifySuperAdmin, createAdmin);
router.get("/all", verifySuperAdmin, getAdmins);
router.put("/:userId/role", verifySuperAdmin, updateAdminRole);

export default router;