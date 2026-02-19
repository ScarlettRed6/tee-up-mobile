import express from "express";
import { 
    createAdmin,
    getAdmins,
    updateAdminRole,
    getAdminProfile 
} from "../controllers/adminController.js";
import { verifyAdmin, verifySuperAdmin } from "../middleware/authMiddleware.js";


