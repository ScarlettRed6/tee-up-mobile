import pool from "../config/db.js";

export async function addReport(reporter_id, listing_id, reported_user_id, reason, photo_url){
    const result = await pool.query(
        `INSERT INTO reports (reporter_id, reported_listing_id, reported_user_id, reason, photo_url)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
        [reporter_id, listing_id || null, reported_user_id || null, reason, photo_url || null]
    );
    return result.rows[0];
}

//For admin functions
export async function getAllReports() {
    const result = await pool.query(
        `SELECT r.*, u.name AS reporter_name, l.title AS listing_title
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        LEFT JOIN listings l ON r.reported_listing_id = l.listing_id
        ORDER BY r.created_at DESC`
    );
    return result.rows;
}//End of getAllReports query

export async function getPendingReportsCount() {
    const query = `
        SELECT COUNT(*) FROM reports
        WHERE status = 'pending'`;
    const result = await pool.query(query);

    return result.rows[0].count;
}//End of getPendingReportsCount query

export async function getCompletedReportsCount() {
    const query = `
        SELECT COUNT(*) FROM reports
        WHERE status = 'complete'`;
    const result = await pool.query(query);

    return result.rows[0].count;
}//End of getCompletedReportsCount query

export async function updateReportsStatus(report_id, status, admin_id) {
    const result = await pool.query(
        `UPDATE reports SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP
        WHERE report_id = $3 RETURNING *`, [status, admin_id, report_id]
    );
    return result.rows[0];
}//End of updateReportsStatus query