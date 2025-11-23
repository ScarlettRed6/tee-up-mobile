import { findUserById, updateUser } from "../models/userModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export async function getUserProfile(req, res){
    try{
        const user = await findUserById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const {id, name, email } = user;
        res.json({ id, name, email });
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
    const { name, email } = req.body;

    try{
        const user = await findUserById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        if(user.provider === "google" && email && email !== user.email){
            return res.status(403).json({ message: "Cannot change email for Google account" });
        }

        let profile_image;
        if(req.file){
            const uploaded = await uploadToCloudinary(req.file.buffer, "users");
            profile_image = uploaded.secure_url;
        }

        const updatedData = {
            name: name || user.name,
            profile_image: profile_image || user.profile_image,
            email: user.provider === "local" ? email : user.email,
        };

        const updatedUser = await updateUser(user.id, updatedData);
        res.status(200).json({ message: "Profile updated successfully", user:updatedUser });
    }catch(err){
        console.log(`Error updating user: ${err}`)
        res.status(500).json({ error: "Error updating user" });
    }

}
