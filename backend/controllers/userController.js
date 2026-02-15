import { 
    findUserById, 
    updateUser, 
    findUserByEmail,
    getAllUsers,
    suspendUserQuery,
    unsuspendUserQuery,
    deleteUserQuery,
    getUserByIdWithStats, 
    } from "../models/userModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export async function getUserProfile(req, res){
    try{
        const user = await findUserById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const {id, name, email, profile_image, provider, bio } = user;
        res.json({ id, name, email, profile_image, provider, bio });
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


