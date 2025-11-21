import pool from "../config/db.js";

// Store a message
export async function storeMessage(conversationId, senderId, message){
    const result = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, message)
        VALUES ($1, $2, $3) RETURNING *`,
        [conversationId, senderId, message]
    );
    return result.rows[0];
}

// Find existing conversation between buyer and seller for a listing (without creating)
export async function findConversation(buyerId, sellerId, listingId){
    // Convert all IDs to integers for consistent comparison
    const buyerIdInt = parseInt(buyerId);
    const sellerIdInt = parseInt(sellerId);
    const listingIdInt = parseInt(listingId);
    
    console.log('findConversation called with:', { buyerId: buyerIdInt, sellerId: sellerIdInt, listingId: listingIdInt });
    
    const result = await pool.query(
        `SELECT * FROM conversations 
        WHERE listing_id = $1 
        AND ((buyer_id = $2 AND seller_id = $3) OR (buyer_id = $3 AND seller_id = $2))`,
        [listingIdInt, buyerIdInt, sellerIdInt]
    );
    
    console.log('findConversation result:', result.rows.length > 0 ? 'Found' : 'Not found', result.rows[0] || null);
    
    return result.rows[0] || null;
}

// Find or create a conversation between buyer and seller for a listing
export async function findOrCreateConversation(buyerId, sellerId, listingId){
    // First, try to find existing conversation
    const existing = await findConversation(buyerId, sellerId, listingId);
    
    if(existing){
        return existing;
    }

    // Create new conversation if not found
    const result = await pool.query(
        `INSERT INTO conversations (buyer_id, seller_id, listing_id)
        VALUES ($1, $2, $3) RETURNING *`,
        [buyerId, sellerId, listingId]
    );
    return result.rows[0];
}

// Get all conversations for a user
export async function getConversationsForUser(userId){
    const result = await pool.query(
        `SELECT 
            c.conversation_id,
            c.buyer_id,
            c.seller_id,
            c.listing_id,
            c.created_at,
            l.title as listing_title,
            l.price as listing_price,
            l.photos as listing_photos,
            CASE 
                WHEN c.buyer_id = $1 THEN seller.name
                ELSE buyer.name
            END as other_user_name,
            CASE 
                WHEN c.buyer_id = $1 THEN seller.id
                ELSE buyer.id
            END as other_user_id,
            (SELECT message FROM messages 
             WHERE conversation_id = c.conversation_id 
             ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages 
             WHERE conversation_id = c.conversation_id 
             ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM conversations c
        LEFT JOIN listings l ON c.listing_id = l.listing_id
        LEFT JOIN users buyer ON c.buyer_id = buyer.id
        LEFT JOIN users seller ON c.seller_id = seller.id
        WHERE c.buyer_id = $1 OR c.seller_id = $1
        ORDER BY COALESCE(
            (SELECT created_at FROM messages 
             WHERE conversation_id = c.conversation_id 
             ORDER BY created_at DESC LIMIT 1),
            c.created_at
        ) DESC`,
        [userId]
    );
    return result.rows;
}

// Get all messages for a conversation
export async function getMessagesForConversation(conversationId){
    const result = await pool.query(
        `SELECT 
            m.*,
            u.name as sender_name
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC`,
        [conversationId]
    );
    return result.rows;
}

// Get conversation by ID
export async function getConversationById(conversationId){
    const result = await pool.query(
        `SELECT 
            c.*,
            l.title as listing_title,
            l.price as listing_price,
            l.photos as listing_photos,
            buyer.name as buyer_name,
            seller.name as seller_name
        FROM conversations c
        LEFT JOIN listings l ON c.listing_id = l.listing_id
        LEFT JOIN users buyer ON c.buyer_id = buyer.id
        LEFT JOIN users seller ON c.seller_id = seller.id
        WHERE c.conversation_id = $1`,
        [conversationId]
    );
    return result.rows[0];
}
