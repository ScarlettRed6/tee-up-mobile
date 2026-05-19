import pool from "../config/db.js";

let schemaReady = null;

/** Ensures table exists and supports suspend / unsuspend action types. */
export async function ensureSuspensionLogsSchema() {
    if (!schemaReady) {
        schemaReady = (async () => {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS suspension_logs (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    admin_id INTEGER NOT NULL REFERENCES users(id),
                    reason TEXT NOT NULL DEFAULT '',
                    suspended_until TIMESTAMPTZ,
                    action VARCHAR(20) NOT NULL DEFAULT 'suspend',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `);
            await pool.query(`
                ALTER TABLE suspension_logs
                ADD COLUMN IF NOT EXISTS action VARCHAR(20) NOT NULL DEFAULT 'suspend'
            `);
        })().catch((err) => {
            schemaReady = null;
            throw err;
        });
    }
    return schemaReady;
}

/**
 * @param {'suspend'|'unsuspend'} action
 */
export async function createSuspensionLog(
    userId,
    adminId,
    reason,
    suspendedUntil = null,
    action = "suspend"
) {
    await ensureSuspensionLogsSchema();
    const normalizedAction = action === "unsuspend" ? "unsuspend" : "suspend";
    const result = await pool.query(
        `INSERT INTO suspension_logs (user_id, admin_id, reason, suspended_until, action)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, adminId, reason, suspendedUntil, normalizedAction]
    );
    return result.rows[0];
}

export async function createUnsuspendLog(userId, adminId, reason = "Account access restored by administrator.") {
    return createSuspensionLog(userId, adminId, reason, null, "unsuspend");
}

export async function getUserSuspensionLogs(userId) {
    await ensureSuspensionLogsSchema();
    const result = await pool.query(
        `SELECT 
            sl.*,
            target.name as user_name,
            target.email as user_email,
            admin.name as admin_name,
            admin.email as admin_email,
            admin.role as admin_role
        FROM suspension_logs sl
        LEFT JOIN users target ON sl.user_id = target.id
        LEFT JOIN users admin ON sl.admin_id = admin.id
        WHERE sl.user_id = $1
        ORDER BY sl.created_at DESC`,
        [userId]
    );
    return result.rows;
}

export async function getAllSuspensionLogs() {
    await ensureSuspensionLogsSchema();
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
