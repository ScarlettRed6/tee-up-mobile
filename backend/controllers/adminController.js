import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { 
    findUserByEmail ,
    createAdminUser,
    getAllAdmins,
    findUserById,
    updateUserRole,
    storeRefreshToken
} from "../models/userModel";

export async function createAdmin(req, res) {
    const { name, email, password, role } = req.body;
    const superAdminId = req.user.id;
    try {
        //Validate user role
        if(role !== 'admin' || role !== 'superadmin') {
            console.log("[ADMIN CONTROLLER] Invalid Role. Must be 'admin' or 'superadmin'");
            return res.status(400).json({ message: "Invalid Role. Must be 'admin' or 'superadmin'" });
        }
        //Check if admin user email already exists in the database
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            console.log("[ADMIN CONTROLLER] Email already exists.");
            return res.status(400).json({ message: "Email already exists."});
        }

        //Begin hashing the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const adminUser = await createAdminUser(name, email, hashedPassword, role);

        console.log("[ADMIN CONTROLLER] Successfully created an admin user.");
        res.status(201).json({
            message: `${role === 'superadmin' ? 'Superadmin' : 'Admin'} created successfully`,
            user: {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role
            }
        });
    } catch (error) {
        console.error("[ADMIN CONTROLLER] Error creating an admin:", error);
        res.status(500).json({ error: error.message });
    }
}//End of createAdmin function

