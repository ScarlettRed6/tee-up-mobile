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

export async function getAdmins(req, res) {
    try {
        const admins = await getAllAdmins();

        console.log("[ADMIN CONTROLLER] Successfully fetched all admin users");
        res.json({ admins });
    } catch (error) {
        console.error("[ADMIN CONTROLLER] Error getting all admin users.");
        res.status(500).json({ error: error.message });
    }
}//End of getAdmins function

//Updates admin role (only a user with superadmin role can use this control)
export async function updateAdminRole(req, res) {
    const { userId } = req.params;
    const { role } = req.body;
    //NOTE: CHECK LATER WHY ROLE NEEDS TO BE VALIDATED IF ADMIN OR SUPERADMIN FOR 
    //UPDATING THE ROLE
    try {
        if (role !== 'admin' && role !== 'superadmin') {
            console.log("[ADMIN CONTROLLER] Invalid role. Must be 'admin' or 'superadmin'");
            return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'superadmin'" });
        }

        const user = await findUserById(userId);
        if(!user){
            console.log("[ADMIN CONTROLLER] User not found.");
            return res.status(404).json({ message: "User not found." });
        }
        //Check if the user who requested the update is an admin
        if(user.role !== 'admin' && user.role !== 'superadmin') {
            console.log("[ADMIN CONTROLLER] User trying to update is not an admin");
            return res.status(400).json({ message: "User trying to update is not an admin" });
        }
        //Prevent superadmin from demoting themselves
        if(parseInt(userId) === req.user.id && role !== 'superadmin'){
            console.log("[ADMIN CONTROLLER] superadmin user cannot demote themselves.");
            return res.status(400).json({ message: "superadmin user cannot demote themselves" });
        }
        
        const updatedUser = await updateUserRole(userId, role);

        console.log("[ADMIN CONTROLLER] Successfully updated admin role.");
        res.json({
            message: "Admin role updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error("[ADMIN CONTROLLER] Error updating admin role.");
        res.status(500).json({ error: error.message });
    }
}//End of updateAdminRole function

export async function getAdminProfile(req, res) {
    const userId = req.user.id;
    try {
        const user = await findUserById(userId);
        if(!user || (user.role !== 'admin' || user.role !== 'superadmin')){
            console.log("[ADMIN CONTROLLER] User not found / user is not an admin");
            return res.status(404).json({ message: " User not found / user is not an admin"});
        }

        console.log("[ADMIN CONTROLLER] Successfully fetched admin profile");
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error("[ADMIN CONTROLLER] Error fetching admin profile.");
        res.status(500).json({ error: error.message });
    }
}//End of getAdminProfile function
