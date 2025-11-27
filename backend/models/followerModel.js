import pool from "../config/db.js";

export async function follow(follower_id, userIdToFollow) {
    const result = await pool.query(
        `INSERT INTO followers (follower_id, following_id)
        VALUES ($1, $2)
        ON CONFLICT (follower_id, following_id) DO NOTHING
        RETURNING *`, [follower_id, userIdToFollow]
    );
    return result.rows;
}

export async function unfollow(follower_id, userIdToUnfollow) {
    const result = await pool.query(
        `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2
        RETURNING *`,[follower_id, userIdToUnfollow]
    );
    return result.rows;
}

export async function getFollowerCount(user_id) {
    const result = await pool.query(
        `SELECT COUNT(*) AS count
        FROM followers WHERE following_id = $1`,
        [user_id]
    );
    return Number(result.rows[0].count);
}

export async function isFollowingUser(follower_id, following_id) {
    const result = await pool.query(
        `SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2 LIMIT 1`,
        [follower_id, following_id]
    );
    return result.rowCount > 0;
}

export async function getFollowersForUser(user_id) {
    const result = await pool.query(
        `SELECT follower_id FROM followers WHERE following_id = $1`,
        [user_id]
    );
    return result.rows;
}