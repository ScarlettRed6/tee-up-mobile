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
    storeResetPassOtp,
    clearOtpFields, 
    storeEmailVerificationOtp,
    verifyUserEmail,
    isUserSuspended,
    getSuspensionMessage,
} from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
/* import dotenv from "dotenv";

dotenv.config(); */

export async function googleAuthSuccess(req, res) {
    try {
        const user = req.user;
        
        if (!user) {
            return res.redirect("http://localhost:5173/login?error=unauthorized");
        }

        const accessToken = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.REFRESH_SECRET, 
            { expiresIn: "7d" }
        );

        await storeRefreshToken(refreshToken, user.id);

        //Package up the basic profile payload for your web frontend
        const userData = encodeURIComponent(JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_image: user.profile_image,
            provider: 'google'
        }));

        res.redirect(`http://localhost:5173/login-success?token=${accessToken}&refreshToken=${refreshToken}&user=${userData}`);
    } catch (err) {
        console.error("Google Authentication Redirection Error: ", err);
        res.redirect("http://localhost:5173/login?error=server_error");
    }
}//End of googleAuthSuccess function

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

        //Here sends the otp for verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        //Store the otp and its expiration
        await storeEmailVerificationOtp(user.id, otp, expiresAt);
        //Send the otp to the email for verification
        await sendEmail(email, "Verify your Email", `Your TeeUp verification code is: ${otp}`);

        const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, { expiresIn: "1h" });

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

        //Stop Google OAuth accounts from passing null to bcrypt
        if (user.provider === "google" || !user.password) {
            return res.status(400).json({
                message: "This account is registered via Google. Please log in using the 'Sign in with Google' button." 
            });
        }

        //Check if user email is verified
        if(!user.is_verified){
            return res.status(403).json({ message: "Email not verified. Please verify your Email" });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if(!validPass) {
            console.log("Invalid Password");
            return res.status(400).json({message: "Invalid password!"});
        }

        if (isUserSuspended(user)) {
            return res.status(403).json({ message: getSuspensionMessage(user) });
        }

        const accessToken = jwt.sign(
            {id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
            {id: user.id, role: user.role}, 
            process.env.REFRESH_SECRET, 
            { expiresIn: "7d" }
        );

        await storeRefreshToken(refreshToken, user.id);

        console.log(`[LOGIN SUCCESS]: Token: ${accessToken}\nRefresh Token: ${refreshToken}`);
        res.json({
            message: "Login successful", 
            token: accessToken, 
            refreshToken: refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_image: user.profile_image ?? null,
                bio: user.bio ?? null,
                provider: user.provider ?? 'local',
                created_at: user.created_at ?? null,
            }
        });
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

        if (isUserSuspended(user)) {
            return res.status(403).json({ message: getSuspensionMessage(user) });
        }

        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
            if(err) return res.status(403).json({ message: "Expired or Invalid refresh token!" });

            const newAccessToken = jwt.sign({ id: user.id, role: user.role}, process.env.JWT_SECRET, { expiresIn: "1h"});
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

        console.log("PASSWORD CHANGED SUCCESSFULLY!");
        res.json({ message: "Password changed successfully" });
    }catch(err){
        console.log("Change password error: ", err);
        res.status(500).json({ message: "Change password error" });
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

export async function verifyResetOtp(req, res){
    const { email, otp } = req.body;

    try{
        const user = await findUserByEmail(email);
        if(!user) return res.status(404).json({ message: "Email not found" });

        //Check reset otp if matches with otp
        if(user.reset_otp !== otp){
            return res.status(400).json({ message: "Invalid OTP" });
        }

        //Chekc if otp is expired
        if(new Date() > user.reset_otp_expires){
            return res.status(400).json({ message: "OTP expired" });
        }

        //Mark OTP as verified by generating a short duration reset token
        const resetToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "10m" });

        console.log("OTP VERIFIED");
        res.json({ message: "OTP verified", resetToken });
    }catch(err){
        console.log("verifyResetOtp error: ", err);
        res.status(500).json({ message: "OTP verification failed" });
    }

}//End of verifyResetOtp function

//Reset password function for forget password feature, different from change  because of OTP
export async function resetPassword(req, res){
    const { resetToken, newPassword, confirmNewPassword } = req.body;

    if(newPassword !== confirmNewPassword){
        console.log("NewPass and ConfirmPass does not match");
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try{
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const user = await findUserById(decoded.id);
        
        //Begin hashing of new password
        const hashed = await bcrypt.hash(newPassword, 10);

        //update the user password from db
        await updateUserPassword(user.id, hashed);

        //clear the otp columns
        await clearOtpFields(user.id);

        console.log("PASSWORD RESET SUCCESSFUL");
        res.json({ message: "Password reset successful!" });
    }catch(err){
        console.log("resetPassword error: ", err);
        res.status(400).json({ message: "Invalid or expired reset token" });
    }

}//End of resetPassword function

//Functions to help with email verification with register
//This send email verification usefull for when otp is expired and want to resend again
export async function sendEmailVerification(req, res){
    const { email } = req.body;

    try{
        const user = await findUserByEmail(email);
        if(!user) return res.status(404).json({ message: "Email not found" });

        //Check if email is already verified
        if(user.is_verified){
            return res.status(400).json({ message: "Email is already verified!" });
        }

        //Generate the otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        //Store the otp
        await storeEmailVerificationOtp(user.id, otp, expiresAt);

        //Then send the otp to the email
        await sendEmail(email, "Verify your Email", `Your TeeUp verification code is: ${otp}`);

        console.log("Otp sent successfully");
        res.json({ message: "Verification OTP sent!" });
    }catch(err){
        console.log(`sendEmailVerification error: ${err}`);
        res.status(500).json({ error: err.message });
    }

}//End of sendEmailVericfication function

export async function verifyEmailOtp(req, res){
    const { email, otp } = req.body;

    try{
        const user = await findUserByEmail(email);
        if(!user) return res.status(404).json({ message: "Email not found" });

        //Check if email is already verified
        if(user.is_verified){
            return res.status(400).json({ message: "Email already verified" });
        }

        //Check if otp matches in the db (normalize types — DB/driver may return number)
        const storedOtp = user.email_verification_otp != null ? String(user.email_verification_otp).trim() : "";
        const bodyOtp = otp != null ? String(otp).trim() : "";
        if(storedOtp !== bodyOtp){
            return res.status(400).json({ message: "Invalid OTP" });
        }

        //Then check also if OTP is expired
        if(new Date() > user.email_verification_expires){
            return res.status(400).json({ message: "OTP expired" });
        }

        //Verify the email
        await verifyUserEmail(user.id);

        console.log("Email successfully verified");
        res.json({ message: "Email verified successfully!" });
    }catch(err){
        console.log(`verifyEmailOtp error: ${err}`);
        res.status(500).json({ error: err.message });
    }

}//End of verifyEmailOtp


