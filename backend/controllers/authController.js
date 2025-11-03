import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

export async function register(req, res){
    const { name, email, password, confirmPassword } = req.body;
    try{
        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });

        if(password !== confirmPassword){
            console.log("Password do not MATCH");
           return res.status(400).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(name, email, hashedPassword);
        res.status(201).json({message: "User registered successfully"});
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

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: "1h"});
        res.json({message: "Login successful", token});
        console.log(`Login Successful| token:${token}`);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}//End of login async function
