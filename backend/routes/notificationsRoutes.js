import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
    listNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../controllers/notificationsController.js";

const router = express.Router();

router.get("/", verifyToken, listNotifications);
router.patch("/read-all", verifyToken, markAllNotificationsAsRead);
router.patch("/:notification_id/read", verifyToken, markNotificationAsRead);

export default router;

