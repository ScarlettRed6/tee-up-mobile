import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { 
    findUserByEmail, 
    createUser, 
    storeRefreshToken, 
    getRefreshToken, 
    findUserByGoogleId, 
    createGoogleUser,
    updateUserPassword, 
    findUserById,
    storeResetPassOtp} from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
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

//Change password and forgot password functions
export async function changePassword(req, res) {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    try{
        const user = await findUserById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        //Check first if user logged in using google oauth
        if (user.provider !== "local"){
            return res.status(403).json({ message: "Google account users cannot change password" });
        }

        //Check if new password matches confirm new password
        if (newPassword !== confirmNewPassword){
            return res.status(400).json({message: "Passwords do not match"});
        }

        //Check compare original inputted password with user password
        const valid = await bcrypt.compare(currentPassword, user.password);
        if(!valid){
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        //If valid, then begin hashing the new password
        const hashed = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(userId, hashed);

    }catch(err){
        console.log("Change password error: ", err);
        return res.status(500).json({ message: "Change password error" });
    }
}//End of changePassword function

//Forgot password implementation with OTP sending and verifying and receiving
export async function sendResetOtp(req, res) {
    const { email } = req.body;

    try{
        //Always check if user exists
        const user = await findUserByEmail(email);
        if(!user) return res.status(404).json({ message: "Email not found" });

        //Check if user is logged in using teeup db
        if(user.provider !== "local"){
            return res.status(403).json({ message: "Logged in using Google account users cannot reset password" });
        }

        //Generate the 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await storeResetPassOtp(otp, expiresAt, user.id);

        //Send email
        await sendEmail(
            user.email,
            "Your Password Reset Code",
            `Your OTP code is: ${otp}`
        );

        console.log("OTP SENT TO EMAIL");
        res.json({ message: "OTP sent to email" });
    }catch(err){
        console.log("sendResetOtp error:", err);
        res.status(500).json({ message: "Error sending OTP" });
    }
}//End of sendResetOtp function

