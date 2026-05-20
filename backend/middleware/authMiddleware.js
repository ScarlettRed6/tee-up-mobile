import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findUserById, isUserSuspended, getSuspensionMessage } from "../models/userModel.js";
dotenv.config();

export async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await findUserById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (isUserSuspended(user)) {
            return res.status(403).json({ message: getSuspensionMessage(user) });
        }

        req.user = { ...decoded, role: user.role };
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or Expired token" });
    }
}

//Admin specific middlewares
export async function verifyAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Access denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await findUserById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (isUserSuspended(user)) {
            return res.status(403).json({ message: getSuspensionMessage(user) });
        }

        if (user.role !== "admin" && user.role !== "superadmin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.user = { ...decoded, role: user.role };
        next();
    } catch (error) {
        console.error(`[AUTH MIDDLEWARE] Error verifying admin or Invalid or Expired token: ${error}`);
        res.status(401).json({ message: "Invalid or Expired token" });
    }
}

export async function verifySuperAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Access denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await findUserById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (isUserSuspended(user)) {
            return res.status(403).json({ message: getSuspensionMessage(user) });
        }

        if (user.role !== "admin" && user.role !== "superadmin") {
            return res.status(403).json({ message: "Superadmin access required" });
        }

        req.user = { ...decoded, role: user.role };
        next();
    } catch (error) {
        console.error(`[AUTH MIDDLEWARE] Error verifying superadmin or Invalid or Expired token: ${error}`);
        res.status(401).json({ message: "Invalid or Expired token" });
    }
}
