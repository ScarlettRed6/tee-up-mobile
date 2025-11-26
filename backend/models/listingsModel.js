import pool from "../config/db.js";

//Create a new listing
export async function insertListing(user_id, title, description, category, brand, condition, price, status, photos){
   const newListing = await pool.query(
        `INSERT INTO listings (user_id, title, description, category, brand, condition, price, status, photos)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [user_id, title, description, category, brand, condition, price, status, photos]
   );
   return newListing.rows[0];
}

//GETS
export async function getAllListings(filters = {}, sort = "newest"){
    let query = `SELECT 
        l.*,
        u.name as seller_name,
        u.email as seller_email,
        u.profile_image as seller_profile_image
    FROM listings l
    LEFT JOIN users u ON l.user_id = u.id`;
    const values = [];
    const whereClauses = [];

    if(filters.category){
        values.push(filters.category);
        whereClauses.push(`l.category = $${values.length}`);
    }

    if(filters.user_id){
        values.push(filters.user_id);
        whereClauses.push(`l.user_id = $${values.length}`);
    }

    if(filters.status){
        values.push(filters.status);
        whereClauses.push(`l.status = $${values.length}`);
    }

    if(whereClauses.length > 0){
        query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    if(sort === "newest"){
        query += ` ORDER BY l.date_posted DESC`;
    }else if (sort === "oldest"){
        query += ` ORDER BY l.date_posted ASC`;
    }else if(sort === "price_low_high"){
        query += ` ORDER BY l.price ASC`;
    }else if(sort === "price_high_low"){
        query += ` ORDER BY l.price DESC`;
    }

    const result = await pool.query(query, values);
    // Ensure photos are parsed as arrays if they're JSON/JSONB
    return result.rows.map(row => ({
        ...row,
        photos: row.photos ? (Array.isArray(row.photos) ? row.photos : JSON.parse(row.photos || '[]')) : []
    }));

}

export async function getListingById(id) {
    const result = await pool.query(
        `SELECT 
            l.*,
            u.name as seller_name,
            u.email as seller_email,
            u.profile_image as seller_profile_image
        FROM listings l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.listing_id = $1`, 
        [id]
    );
    if (!result.rows[0]) return null;
    
    // Ensure photos are parsed as arrays if they're JSON/JSONB
    const listing = result.rows[0];
    if (listing.photos) {
        listing.photos = Array.isArray(listing.photos) 
            ? listing.photos 
            : (typeof listing.photos === 'string' ? JSON.parse(listing.photos || '[]') : []);
    } else {
        listing.photos = [];
    }
    
    return listing;
}

//UPDATES
export async function updateListing(id, title, description, category, brand, condition, price, status, photos) {
    const result = await pool.query(
        `UPDATE listings SET title = $1, description = $2, category = $3, brand = $4, condition = $5, price = $6, status = $7, photos = $8
        WHERE listing_id = $9 RETURNING *`,
        [title, description, category, brand, condition, price, status, photos, id]
    );
    return result.rows[0];
}

export async function updateListingStatus(listing_id, user_id, status) {
    const result = await pool.query(
        `UPDATE listings SET status = $1
        WHERE id = $2 AND user_id = $3
        RETURNING *`, [status, listing_id, user_id]
    );
    return result.rows[0];
}

//DELETES
export async function deleteListing(id) {
    const result = await pool.query(`DELETE FROM listings WHERE listing_id = $1 RETURNING *`, [id]);
    return result.rows[0];
}
