import pool from "../config/db.js";

export async function addOrUpdateRating(rated_user_id, rater_user_id, rating, review) {
    const result = await pool.query(
        `INSERT INTO user_ratings (rated_user_id, rater_user_id, rating, review)
        VALUES ($1, $2, $3, $4) ON CONFLICT (rated_user_id, rater_user_id)
        DO UPDATE SET rating = EXCLUDED.rating, review = EXCLUDED.review
        RETURNING *`, [rated_user_id, rater_user_id, rating, review]
    );
    return result.rows[0];
}

export async function getUserRatings(rated_user_id) {
    const result = await pool.query(
        `SELECT ur.rating, ur.review, ur.created_at,
                u.name AS reviewer_name,
                u.profile_image AS reviewer_profile_image
         FROM user_ratings ur
         LEFT JOIN users u ON ur.rater_user_id = u.id
         WHERE ur.rated_user_id = $1
         ORDER BY ur.created_at DESC`,
        [rated_user_id]
    );
    return result.rows;
}

export async function getUserRatingSummary(rated_user_id) {
    const result = await pool.query(
        `SELECT 
            COALESCE(AVG(rating), 0)::numeric(10,2) AS average_rating,
            COUNT(*) AS total_raters
         FROM user_ratings WHERE rated_user_id = $1`,
         [rated_user_id]
    );
    return result.rows[0];
}
