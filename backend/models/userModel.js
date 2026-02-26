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

//Create user for registration logic
export async function createUser(name, email, hashedPassword, role = 'user'){
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, email, hashedPassword, role]
    );
    return result.rows[0];
}

export async function updateUser(userId, data){
    const { name, email, bio, profile_image } = data;
    const result = await pool.query(
        `UPDATE users SET name = $1, email = $2, bio = $3, profile_image = $4
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

//Here starts email verification 
export async function storeEmailVerificationOtp(id, otp, expiresAt){
    await pool.query(
        `UPDATE users SET email_verification_otp = $1, email_verification_expires = $2
        WHERE id = $3`, [otp, expiresAt, id]
    );
}

export async function verifyUserEmail(id) {
    const result = await pool.query(`
        UPDATE users SET is_verified = true, email_verification_otp = NULL, email_verification_expires = NULL
        WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}


//ADMIN SPECIFIC QUERIES

export async function getUserByIdWithStats(id) {
    const query = `
        SELECT 
            u.*,
            COALESCE(listing_stats.total_listings, 0) as total_listings,
            COALESCE(listing_stats.sold_listings, 0) as total_sales,
            COALESCE(rating_stats.average_rating, 0)::numeric(10,2) as rating,
            COALESCE(rating_stats.total_ratings, 0) as total_ratings
        FROM users u
        LEFT JOIN (
            SELECT 
                user_id,
                COUNT(*) as total_listings,
                COUNT(*) FILTER (WHERE status = 'sold') as sold_listings
            FROM listings
            GROUP BY user_id
        ) listing_stats ON u.id = listing_stats.user_id
        LEFT JOIN (
            SELECT 
                rated_user_id,
                AVG(rating)::numeric(10,2) as average_rating,
                COUNT(*) as total_ratings
            FROM user_ratings
            GROUP BY rated_user_id
        ) rating_stats ON u.id = rating_stats.rated_user_id
        WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}//End of getUserByIdWithStats query

export async function getAllUsers(search = "") {
    let query = `
        SELECT 
            u.*,
            COALESCE(listing_stats.total_listings, 0) as total_listings,
            COALESCE(listing_stats.sold_listings, 0) as total_sales,
            COALESCE(rating_stats.average_rating, 0)::numeric(10,2) as rating,
            COALESCE(rating_stats.total_ratings, 0) as total_ratings
        FROM users u
        LEFT JOIN (
            SELECT 
                user_id,
                COUNT(*) as total_listings,
                COUNT(*) FILTER (WHERE status = 'sold') as sold_listings
            FROM listings
            GROUP BY user_id
        ) listing_stats ON u.id = listing_stats.user_id
        LEFT JOIN (
            SELECT 
                rated_user_id,
                AVG(rating)::numeric(10,2) as average_rating,
                COUNT(*) as total_ratings
            FROM user_ratings
            GROUP BY rated_user_id
        ) rating_stats ON u.id = rating_stats.rated_user_id
    `;
    let params = [];

    if (search) {
        query += ` WHERE (u.name ILIKE $1 OR u.email ILIKE $1)`;
        params.push(`%${search}%`);
    }

    query += ` ORDER BY u.id ASC`;

    const result = await pool.query(query, params);
    return result.rows;
}//End of getAllUsers query

export async function getUserCount() {
    const query = `
    SELECT COUNT(*) FROM users
    WHERE role = 'user'`;
    const result = await pool.query(query);

    return result.rows[0].count;
}//End of getTotalUserCount query

export async function getActiveUsers() {
    const query = `
    SELECT COUNT(*) FROM users
    WHERE (suspended_until IS NULL OR suspended_until <= NOW())
    AND role = 'user'`;
    const result = await pool.query(query);

    return result.rows[0].count;
}//End of getActiveUsers query

export async function suspendUserQuery(userId, suspendedUntil = null) {
    if (suspendedUntil) {
        const result = await pool.query(
            `UPDATE users SET suspended_until = $2
            WHERE id = $1 RETURNING *`,
            [userId, suspendedUntil]
        );
    } else {
        const result = await pool.query(
            `UPDATE users SET suspended_until = NULL
            WHERE id = $1 RETURNING *`,
            [userId]
        );
    }//End of if else statement
    return result.rows[0];
}//End of suspendUserQuery

export async function unsuspendUserQuery(userId) {
    const result = await pool.query(
        `UPDATE users SET suspended_until = NULL
        WHERE id = $1 RETURNING *`,
        [userId]
    );
    return result.rows[0];
}//End of unsuspendUserQuery

export async function deleteUserQuery(userId){
    const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING *`,
        [userId]
    );
    return result.rows[0];
}//End of deleteUserQuery

//Similar to createUser but for creating an admin user
export async function createAdminUser(name, email, hashedPassword, role = 'admin') {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role, is_verified)
        VALUES ($1, $2, $3, $4, true) RETURNING *`,
        [name, email, hashedPassword, role]
    );
    return result.rows[0];
}//End of adminCreateUserQuery

export async function getAllAdmins() {
    const result = await pool.query(
        `SELECT id, name, email, role, created_at 
        FROM users 
        WHERE role IN ('admin', 'superadmin')
        ORDER BY created_at DESC`
    );
    return result.rows;
}//End of getAllAdmins query

export async function updateUserRole(userId, role) {
    const result = await pool.query(
        `UPDATE users SET role = $1 WHERE id = $2 RETURNING *`,
        [role, userId]
    );
    return result.rows[0];
}//End of updateUserRole

