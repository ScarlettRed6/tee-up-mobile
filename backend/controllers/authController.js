import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser, storeRefreshToken, getRefreshToken } from "../models/userModel.js";
/* import dotenv from "dotenv";

dotenv.config(); */

export async function register(req, res){
    const { name, email, password, confirmPassword } = req.body;
    try{
        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });

        if(password !== confirmPassword){
            console.log("Passwords do not MATCH");
           return res.status(400).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(name, email, hashedPassword);

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "User registered successfully", token });
    }catch(err){
        res.status(500).json({ error: err.message });
    }

}//End of register async function

export async function login(req, res){
    const { email, password } = req.body;
    try{
        const user = await findUserByEmail(email);
        if(!user) return res.status(400).json({message: "User is not founding"});

        const validPass = await bcrypt.compare(password, user.password);
        if(!validPass) return res.status(400).json({message: "Invalid password!"});

        const accessToken = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({id: user.id}, process.env.REFRESH_SECRET, { expiresIn: "7d" });

        await storeRefreshToken(refreshToken, user.id);

        res.json({message: "Login successful", token: accessToken, refreshToken: refreshToken });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}//End of login async function

export async function refreshToken(req, res){
    const { refreshToken } = req.body;
    if(!refreshToken) return res.status(401).json({ message: "Refresh token missing!" });

    try{
        const user = await getRefreshToken(refreshToken);
        if(!user) return res.status(403).json({ message: "Invalid refresh token!" });

        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
            if(err) return res.status(403).json({ message: "Expired or Invalid refresh token!" });

            const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h"});
            res.json({ token: newAccessToken });
        });

    }catch(err){
        res.status(500).json({ error: err.message });
    }

}
