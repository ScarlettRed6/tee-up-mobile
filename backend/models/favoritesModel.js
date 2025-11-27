import pool from "../config/db.js";


export async function addFavorite(user_id, listing_id) {
    const result = await pool.query(
        `INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)
        ON CONFLICT (user_id, listing_id) DO NOTHING
        RETURNING *`, [user_id, listing_id]
    );
    return result.rows[0];
}

export async function removeFavorite(user_id, listing_id) {
    const result = await pool.query(
        `DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2
        RETURNING *`, [user_id, listing_id]
    );
    return result.rows[0];
}

export async function getUserFavorites(user_id) {
    const result = await pool.query(
        `SELECT f.*, l.* FROM favorites f
        JOIN listings l ON f.listing_id = l.listing_id
        WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
        [user_id]
    );
    return result.rows.map(row => ({
        ...row,
        photos: row.photos || [],
    }));
}

export async function getUsersWhoFavorited(listing_id) {
    const result = await pool.query(
        `SELECT user_id FROM favorites WHERE listing_id = $1`,
        [listing_id]
    );
    return result.rows[0];
}

