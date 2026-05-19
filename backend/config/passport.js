import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
    findUserByGoogleId,
    findUserByEmail,
    createGoogleUser,
    isUserSuspended,
    getSuspensionMessage,
} from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5000;
const googleCallbackURL =
    process.env.GOOGLE_CALLBACK_URL ||
    `http://localhost:${port}/api/auth/google/callback`;

console.log(
    `[Google OAuth] callback URL (add to Google Cloud → Authorized redirect URIs):\n  ${googleCallbackURL}`
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: googleCallbackURL,
            scope: ["profile", "email"],
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const googleId = profile.id;
                const email = profile.emails[0].value;
                const name = profile.displayName;
                const picture = profile.photos[0]?.value;

                //Check if a user with this Google ID already exists in TeeUp
                let user = await findUserByGoogleId(googleId);

                if (!user) {
                    //If no Google ID, check if their email was registered via local signup
                    const emailUser = await findUserByEmail(email);
                    if (emailUser && emailUser.provider === "local") {
                        //Prevent account collision (local account trying to log in via Google)
                        return done(null, false, { message: "This email is already registered using local login" });
                    }

                    //Brand new user: Create them using the Option A model update we just made!
                    user = await createGoogleUser(name, email, googleId, picture);
                }

                if (isUserSuspended(user)) {
                    return done(null, false, { message: getSuspensionMessage(user) });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

export default passport;

