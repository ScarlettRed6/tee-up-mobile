import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { findUserByEmail, createUser, storeRefreshToken, getRefreshToken, findUserByGoogleId, createGoogleUser } from "../models/userModel.js";
/* import dotenv from "dotenv";

dotenv.config(); */

const googleClientId = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(googleClientId);

export async function googleAuth(req, res) {
    try{
        const { idToken } = req.body;

        const ticket = await client.verifyIdToken({
            idToken,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;

        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        let user = await findUserByGoogleId(googleId);

        if(!user){
            const emailUser = await findUserByEmail(email);
            if(emailUser && emailUser.provider === "local"){
                return res.status(400).json({ message: "This email is already registered using local login" });
            }

            user = await createGoogleUser(name, email, googleId, picture);
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: "1h"});
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, {expiresIn: "7d"});

        await storeRefreshToken(refreshToken, user.id);

        res.status(200).json({ message: "Google login successful", token: accessToken, refreshToken, user });
    }catch(err){
        console.error("Google login error: ", err);
        res.status(500).json({ message: "Google login failed" });
    }
}

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
        if(!user) return res.status(400).json({message: "User not found"});

        const validPass = await bcrypt.compare(password, user.password);
        if(!validPass) {
            console.log("Invalid Password");
            return res.status(400).json({message: "Invalid password!"});
        }

        const accessToken = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({id: user.id}, process.env.REFRESH_SECRET, { expiresIn: "7d" });

        await storeRefreshToken(refreshToken, user.id);

        console.log(`Token: ${accessToken}\nRefresh Token: ${refreshToken}`);
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
}//End of refreshToken function
