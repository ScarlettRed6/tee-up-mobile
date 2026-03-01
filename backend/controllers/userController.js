import { 
    findUserById, 
    updateUser, 
    findUserByEmail,
    getAllUsers,
    getActiveUsers,
    getUserCount,
    getTopSellers,
    suspendUserQuery,
    unsuspendUserQuery,
    deleteUserQuery,
    getUserByIdWithStats,
    getActiveListingsCount,
    } from "../models/userModel.js";
import { 
    createSuspensionLog,
    getUserSuspensionLogs,
    getAllSuspensionLogs
 } from "../models/suspensionLogModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export async function getUserProfile(req, res){
    try{
        const user = await findUserById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const {id, name, email, profile_image, provider, bio, created_at } = user;
        res.json({ id, name, email, profile_image, provider, bio, created_at: created_at || null });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}//End of getUserProfile function

export async function getUserById(req, res){
    try{
        const userId = req.params.id;
        const user = await findUserById(userId);

        if(!user){
            console.log("USERCONTROLLER: USER DOES NOT EXIST");
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.json(user);
    }catch(err){
        console.error("(USERCONTROLLER) ERROR FETCHING USER BY ID: ", err);
        return res.status(500).json({ message: "Fetching error" });
    }
}//End of getUserById function

/** Public profile with stats (no auth). Returns safe fields + listing/rating stats. */
export async function getPublicUserProfile(req, res) {
    try {
        const userId = req.params.id;
        const userWithStats = await getUserByIdWithStats(userId);
        if (!userWithStats) {
            return res.status(404).json({ message: "User not found" });
        }
        const activeCount = await getActiveListingsCount(userId);
        res.json({
            id: userWithStats.id,
            name: userWithStats.name,
            profile_image: userWithStats.profile_image,
            bio: userWithStats.bio || null,
            created_at: userWithStats.created_at,
            total_listings: Number(userWithStats.total_listings) || 0,
            total_sales: Number(userWithStats.total_sales) || 0,
            active_listings: activeCount,
            rating: Number(userWithStats.rating) || 0,
            total_ratings: Number(userWithStats.total_ratings) || 0,
        });
    } catch (err) {
        console.error("(USERCONTROLLER) getPublicUserProfile:", err);
        res.status(500).json({ message: "Failed to load profile" });
    }
}

/** Current user's profile stats (auth required). */
export async function getProfileStats(req, res) {
    try {
        const userId = req.user.id;
        const userWithStats = await getUserByIdWithStats(userId);
        const activeCount = await getActiveListingsCount(userId);
        res.json({
            active_listings: activeCount,
            total_ratings: Number(userWithStats?.total_ratings) || 0,
            rating: Number(userWithStats?.rating) || 0,
            total_listings: Number(userWithStats?.total_listings) || 0,
            total_sales: Number(userWithStats?.total_sales) || 0,
        });
    } catch (err) {
        console.error("(USERCONTROLLER) getProfileStats:", err);
        res.status(500).json({ message: "Failed to load stats" });
    }
}

export async function updateUserProfile(req, res){
    const userId = req.user.id;
    const { name, email, bio } = req.body;

    try{
        const user = await findUserById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        if(user.provider === "google" && email && email !== user.email){
            return res.status(403).json({ message: "Cannot change email for Google account" });
        }

        if(user.provider === "local" && email && email !== user.email){
            const existing = await findUserByEmail(email);
            if(existing) return res.status(400).json({ message: "Email already in use" });
        }

        let profileImage = user.profile_image;
        if(req.file){
            const uploaded = await uploadToCloudinary(req.file.buffer, "users");
            profileImage = uploaded.secure_url;
        }

        const updatedData = {
            name: name || user.name,
            email: user.provider === "local" ? (email || user.email) : user.email,
            bio: bio || user.bio,
            profile_image: profileImage,
        };

        const updatedUser = await updateUser(user.id, updatedData);
        res.status(200).json({ message: "Profile updated successfully", user:updatedUser });
    }catch(err){
        console.log(`Error updating user: ${err}`)
        return res.status(500).json({ error: "Error updating user profile" });
    }

}


//ADMIN SPECIFIC USER CONTROLLERS

//Similar to getUserById but with the user's stats for admin
export async function adminGetUserById(req, res) {
    try {
        const userId = req.params.id;
        const user = await getUserByIdWithStats(userId);

        if(!user){
            console.log("[USERCONTROLLER]: USER DOES NOT EXIST");
            return res.status(404).json({ message: "User not found." });
        }

        console.log("[USERCONTROLLER]: fetch user by id with stats Success.");
        return res.json(user);
    } catch (error) {
        console.error("[USERCONTROLLER]: ERROR FETCHING USER BY ID: ", error);
        return res.status(500).json({ message: "[USERCONTROLLER]: ERROR FETCHING USER BY ID" });
    }
}//End of adminGetUserById

export async function getUsers(req, res) {
    try {
        const search = req.query.search || "";
        const result = await getAllUsers(search);

        console.log("[USER CONTROLLER] Successfully fetched all users.");
        res.status(200).json(result);
    } catch (error) {
        console.error("[USER CONTROLLER] Error fetching all users.");
        res.status(500).json({ error: error.message });
    }
}//End of getUsers function

export async function getAllActiveUsersCount(req, res) {
    try {
        const result = await getActiveUsers();
        res.status(200).json({ message: "Successfully fetched all active users", activeCount: result ?? 0 });
    } catch (error) {
        console.error(`[USER CONTROLLER] Error fetching count of active users: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}//End of getAllActiveUsersCount

export async function getTotalUserCount(req, res) {
    try {
        const result = await getUserCount();
        res.status(200).json({ message: "Successfully fetched total user count", totalUsers: result ?? 0 });
    } catch (error) {
        console.error(`[USER CONTROLLER] Error fetching total user count: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}//End of getTotalUserCount function

export async function getTopSellersList(req, res) {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
        const result = await getTopSellers(limit);
        res.status(200).json({ message: "Successfully fetched top sellers", topSellers: result });
    } catch (error) {
        console.error(`[USER CONTROLLER] Error fetching top sellers: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}//End of getTopSellersList function

export async function suspendUser(req, res) {
    try {
        const adminId = req.user.id;
        const adminRole = req.user.role;
        const targetUserId = parseInt(req.params.id);
        const { duration, reason } = req.body;

        if(!reason || reason.trim() === ''){
            console.log("[USER CONTROLLER] Reason is required for user account suspension");
            return res.status(400).json({ message: "Reason for suspension is required"});
        }

        const targetUser = await findUserById(targetUserId);
        if(!targetUser) {
            console.log("[USER CONTROLLER] Target user for suspension is not found");
            return res.status(404).json({ message: "Target user for suspension is not found"});
        }

        // Permission checks:
        // - Admin can only suspend users (not admins or superadmins)
        // - Superadmin can suspend both users and admins (but not superadmins)
        if (adminRole === 'admin') {
            if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
                return res.status(403).json({ 
                    message: "Admins cannot suspend fellow admins. Only superadmins can suspend admins." 
                });
            }
        } else if (adminRole === 'superadmin') {
            if (targetUser.role === 'superadmin') {
                return res.status(403).json({ 
                    message: "Cannot suspend another superadmin" 
                });
            }
        } else {
            return res.status(403).json({ message: "Admin access required" });
        }

        let suspendedUntil = null;
        if(duration && duration > 0){
            const now = new Date();
            suspendedUntil = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
        }

        //Suspend the user
        const suspended = await suspendUserQuery(targetUserId, suspendedUntil);
        if(!suspended){
            console.log("[USER CONTROLLER] User to suspend not found");
            return res.status(404).json({ message: "User not found" });
        }

        //Log the suspension
        await createSuspensionLog(targetUserId, adminId, reason.trim(), suspendedUntil);

        console.log("[USER CONTROLLER] Successfully suspended the user.");
        res.status(200).json({
            message: suspendedUntil
                ? `User suspended successfully until ${suspendedUntil.toISOString().split('T')[0]}`
                : "User suspended permanently",
            suspended: suspended
        });
    } catch (error) {
        console.error("[USER CONTROLLER] Error in suspending a user.");
        res.status(500).json({ error: error.message});
    }
}//End of suspendUser function

export async function unsuspendUser(req, res) {
    try {
        const adminId = req.user.id;
        const targetUserId = parseInt(req.params.id);

        const targetUser = await findUserById(targetUserId);
        if(!targetUser){
            console.log("[USER CONTROLLER]Target user for suspension removal not found/does not exist");
            return res.status(404).json({ message: "User not found" });
        }

        const unsuspended = await unsuspendUserQuery(targetUserId);
        if(!unsuspended){
            console.log("[USER CONTROLLER]Target user for suspension removal not found/does not exist(2)");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("[USER CONTROLLER] User suspension removal Success");
        res.status(200).json({ 
            message: "User suspension removal success",
            user: unsuspended
         });
    } catch (error) {
        console.error("[USER CONTROLLER] Error removing user suspension");
        res.status(500).json({ error: error.message });
    }
}//End of unsuspendUser function

//This suspension logs getter handles either single user suspension log or all suspension logs
export async function getSuspensionLogs(req, res) {
    try {
        const userId = req.query.userId;

        if(userId) {
            const logs = await getUserSuspensionLogs(parseInt(userId));
            console.log("[USER CONTROLLER] Successfully fetched user suspension log");
            res.status(200).json({
                message: "Fetched user suspension log successfully",
                logs: logs
            });
        } else {
            const logs = await getAllSuspensionLogs();
            console.log("[USER CONTROLLER] Successfully fetched all suspension logs");
            res.status(200).json({ 
                message: "Fetched all suspension logs succussfully",
                logs: logs
            });
        }
    } catch (error) {
        console.error("[USER CONTROLLER] Error fetching suspension logs");
        res.status(500).json({ error: error.message});
    }
}//End of getSuspensionLogs function

export async function deleteUser(req, res) {
    try {
        const userId = req.params.id;
        const deleted = await deleteUserQuery(userId);
        if(!deleted){
            console.log("[USER CONTROLLER] User not found for account deletion");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("[USER CONTROLLER] Successfully deleted user account");
        res.status(200).json({
            message: "User deleted successfully",
            deleted: deleted
        });
    } catch (error) {
        console.error(`[USER CONTROLLER] Error deleting user account: ${error}`);
        res.status(500).json({ error: error.message });
    }
}//End of deleteUser function

export async function adminUpdateUser(req, res) {
    try {
        const targetUserId = req.params.id;
        const { name, email, bio } = req.body;

        const user = await findUserById(targetUserId);
        if(!user){
            console.log("[USER CONTROLLER] User not found for updating user account");
            return res.status(404).json({ message: "User not found" });
        }

        if(email && email !== user.email){
            const exists = await findUserByEmail(email);
            if(exists){
                console.log("[USER CONTROLLER] Email already in use");
                return res.status(400).json({ message: "Email already in use"});
            }
        }//End of if statement

        //If there is new profile if attached update it
        //Check later if this updates and also removes the old profile 
        //I think it should delete the old profile replaced by the new one
        let profileImage = user.profile_image;
        if (req.file){
            const uploaded = await uploadToCloudinary(req.file.buffer, "users");
            profileImage = uploaded.secure_url;
        }

        const updatedUser = await updateUser(targetUserId, {
            name: name || user.name,
            email: email || user.email,
            bio: bio || user.bio,
            profile_image: profileImage
        });

        console.log("[USER CONTROLLER] Successfully updated user account");
        res.status(200).json({ 
            message: "User updated successfully",
            user: updatedUser
         });
    } catch (error) {
        console.error(`[USER CONTROLLER] Error updating the user account: ${error}`);
        res.status(500).json({ error: error.message });
    }
}//End of adminUpdateUser function

