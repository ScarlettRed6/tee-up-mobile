import pool from "../config/db.js";

//Store refresh token
export async function storeRefreshToken(refreshToken, userId) {
    const result = await pool.query(
        `UPDATE users SET refresh_token = $1 WHERE id = $2`,
        [refreshToken, userId]
    );
    return result.rows[0];
}

//Get matching refresh token
export async function getRefreshToken(refreshToken){
    const result = await pool.query(
        `SELECT * FROM users WHERE refresh_token = $1`,
        [refreshToken]
    );
    return result.rows[0];
}

//FINDER FUNCTIONS
export async function findUserByEmail(email){
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`, [email]
    );
    return result.rows[0];
}

export async function findUserById(id){
    const user = await pool.query(
        `SELECT * FROM users WHERE id = $1`, [id]
    );
    return user.rows[0];
}

export async function createUser(name, email, hashedPassword){
    const result = await pool.query(
        `INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3) RETURNING *`,
        [name, email, hashedPassword]
    );
    return result.rows[0];
}

export async function updateUser(userId, data){
    const { name, email, bio, profile_image } = data;
    const result = await pool.query(
        `UPDATE users SET name = $1, email = $2, bio = $3 profile_image = $4
        WHERE id = $5 RETURNING *`, [name, email, bio, profile_image, userId]
    );
    return result.rows[0];
}

//Google oAuth related queries
export async function findUserByGoogleId(googleId) {
    const result = await pool.query(
        `SELECT * FROM users WHERE google_id = $1`,
        [googleId]
    );
    return result.rows[0];
}

export async function createGoogleUser(name, email, googleId, profileImage){
    const result = await pool.query(
        `INSERT INTO users (name, email, provider, google_id, profile_image)
        VALUES ($1, $2, 'google', $3, $4) RETURNING *`,
        [name, email, googleId, profileImage]
    );
    return result.rows[0];
}

//For change password
export async function updateUserPassword(id, hashedPassword) {
    const result = await pool.query(
        `UPDATE users SET password = $1 WHERE id = $2 RETURNING *`,
        [hashedPassword, id]
    );
    return result.rows[0];
}

//Storing otp
export async function storeResetPassOtp(otp, expiresAt, id){
    const result = await pool.query(
        `UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE id = $3`,
        [otp, expiresAt, id]
    );
    return result.rows[0];
}

//Clearing of otp columns data
export async function clearOtpFields(id){
    const result = await pool.query(
        `UPDATE users SET reset_otp = NULL, reset_otp_expires = NULL WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}
