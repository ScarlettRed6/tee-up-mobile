import pool from "../config/db.js";

export async function createNotification(user_id, type, message, data = {}) {
    const result = await pool.query(
        `INSERT INTO notifications (user_id, type, message, data)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [user_id, type, message, data]
    );
    return result.rows[0];
}
