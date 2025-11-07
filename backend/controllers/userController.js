import { findUserById } from "../models/userModel.js";

export async function getUserProfile(req, res){
    try{
        const user = await findUserById(req.use.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const {id, name, email } = user;
        res.json({ id, name, email });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}//End of getUserProfile function
