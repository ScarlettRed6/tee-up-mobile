import pool from "../config/db.js";

const ensuredColumns = new Set();
let primaryKeyColumn = "id";

async function detectPrimaryKeyColumn() {
    if (primaryKeyColumn) return primaryKeyColumn;
    try {
        const result = await pool.query(
            `SELECT a.attname AS column_name
             FROM pg_index i
             JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
             WHERE i.indrelid = 'notifications'::regclass AND i.indisprimary`
        );
        if (result.rows.length > 0 && result.rows[0].column_name) {
            primaryKeyColumn = result.rows[0].column_name;
        } else {
            primaryKeyColumn = "id";
        }
    } catch (error) {
        console.error("Failed to detect notifications primary key column:", error.message);
        primaryKeyColumn = "id";
    }
    return primaryKeyColumn;
}

async function ensureReadAtColumn() {
    if (ensuredColumns.has("read_at")) return;
    try {
        await pool.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL`);
    } catch (error) {
        console.error("Failed to ensure read_at column on notifications table:", error.message);
    } finally {
        ensuredColumns.add("read_at");
    }
}

function attachNotificationId(row, pkColumn) {
    if (!row) return row;
    if (row.notification_id !== undefined && row.notification_id !== null) {
        return row;
    }
    if (pkColumn && row[pkColumn] !== undefined) {
        return {
            ...row,
            notification_id: row[pkColumn],
        };
    }
    return row;
}

export async function getUserNotifications(user_id) {
    await ensureReadAtColumn();
    const pkColumn = await detectPrimaryKeyColumn();
    const result = await pool.query(
        `SELECT *
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC`,
        [user_id]
    );
    return result.rows.map((row) => attachNotificationId(row, pkColumn));
}

export async function markNotificationRead(notification_id, user_id) {
    await ensureReadAtColumn();
    const pkColumn = await detectPrimaryKeyColumn();
    const result = await pool.query(
        `UPDATE notifications
        SET read_at = COALESCE(read_at, NOW())
        WHERE ${pkColumn} = $1 AND user_id = $2
        RETURNING *`,
        [notification_id, user_id]
    );
    return attachNotificationId(result.rows[0], pkColumn);
}

export async function markAllNotificationsRead(user_id) {
    await ensureReadAtColumn();
    const pkColumn = await detectPrimaryKeyColumn();
    const result = await pool.query(
        `UPDATE notifications
        SET read_at = COALESCE(read_at, NOW())
        WHERE user_id = $1 AND read_at IS NULL
        RETURNING *`,
        [user_id]
    );
    return result.rows.map((row) => attachNotificationId(row, pkColumn));
}

