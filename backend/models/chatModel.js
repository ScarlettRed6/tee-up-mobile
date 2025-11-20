import pool from "../config/db.js";

export async function storeMessage(conversationId, senderId, message){
    const result = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, message)
        VALUES ($1, $2, $3) RETURNING *`,
        [conversationId, senderId, message]
    );
    return result.rows[0];
}
