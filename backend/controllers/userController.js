import { findUserById } from "../models/userModel.js";

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

