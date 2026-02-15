import pool from "../config/db";

/**
 * Create a suspension log entry
 * @param {number} userId - The ID of the user being suspended
 * @param {number} adminId - The ID of the admin performing the suspension
 * @param {string} reason - The reason for suspension
 * @param {Date} suspendedUntil - The date when suspension ends (null for permanent)
 * @returns {Promise<Object>} The created suspension log
 */
export async function createSuspensionLog(userId, adminId, reason, suspendedUntil) {
    const result = await pool.query(
        `INSERT INTO suspension_logs (user_id, admin_id, reason, suspended_until)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, adminId, reason, suspendedUntil]
    );
    return result.rows[0];
}

/**
 * Get all suspension logs for a user
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} Array of suspension logs
 */
export async function getUserSuspensionLogs(userId) {
    const result = await pool.query(
        `SELECT 
            sl.*,
            u.name as admin_name,
            u.email as admin_email,
            u.role as admin_role
        FROM suspension_logs sl
        LEFT JOIN users u ON sl.admin_id = u.id
        WHERE sl.user_id = $1
        ORDER BY sl.created_at DESC`,
        [userId]
    );
    return result.rows;
}

/**
 * Get all suspension logs (admin view)
 * @returns {Promise<Array>} Array of all suspension logs
 */
export async function getAllSuspensionLogs() {
    const result = await pool.query(
        `SELECT 
            sl.*,
            u.name as user_name,
            u.email as user_email,
            admin.name as admin_name,
            admin.email as admin_email,
            admin.role as admin_role
        FROM suspension_logs sl
        LEFT JOIN users u ON sl.user_id = u.id
        LEFT JOIN users admin ON sl.admin_id = admin.id
        ORDER BY sl.created_at DESC`
    );
    return result.rows;
}

