import pool from "../config/db.js";

//Store refresh token
export async function storeRefreshToken(refreshToken, userId) {
    const result = await pool.query(
        `UPDATE users SET refresh_token = $1 WHERE id = $2`,
        [refreshToken, userId]
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


