import pool from "../config/db.js";

//Create a new listing
export async function insertListing(user_id, title, description, category, brand, flex, hand, condition, price, status, photos, location){
   const newListing = await pool.query(
        `INSERT INTO listings (user_id, title, description, category, brand, flex, hand, condition, price, status, photos, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [user_id, title, description, category, brand, flex, hand, condition, price, status, photos, location || null]
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
        // Normalize category - trim and handle case sensitivity
        const normalizedCategory = filters.category.trim();
        values.push(normalizedCategory);
        // Use case-insensitive comparison to handle any casing differences
        // Note: PostgreSQL parameterized queries use $1, $2, etc.
        whereClauses.push(`LOWER(TRIM(l.category)) = LOWER(TRIM($${values.length}))`);
        console.log('🔍 [Backend Model] Filtering by category:', normalizedCategory);
        console.log('🔍 [Backend Model] SQL will be: LOWER(TRIM(l.category)) = LOWER(TRIM($' + values.length + '))');
    }

    if (filters.flex){
        values.push(filters.flex);
        whereClauses.push(`l.flex = $${values.length}`);
    }

    if (filters.hand){
        values.push(filters.hand);
        whereClauses.push(`l.hand = $${values.length}`);
    }

    if(filters.user_id){
        values.push(filters.user_id);
        whereClauses.push(`l.user_id = $${values.length}`);
    }

    if(filters.status){
        values.push(filters.status);
        whereClauses.push(`l.status = $${values.length}`);
    }

    if(filters.condition){
        values.push(filters.condition);
        whereClauses.push(`l.condition = $${values.length}`);
    }

    // Handle min_price - can be number or string that can be parsed
    if(filters.min_price !== undefined && filters.min_price !== null && filters.min_price !== ''){
        const minPriceNum = typeof filters.min_price === 'number' ? filters.min_price : parseFloat(filters.min_price);
        if(!Number.isNaN(minPriceNum) && minPriceNum >= 0){
            values.push(minPriceNum);
            whereClauses.push(`l.price >= $${values.length}`);
        }
    }

    // Handle max_price - can be number or string that can be parsed
    if(filters.max_price !== undefined && filters.max_price !== null && filters.max_price !== ''){
        const maxPriceNum = typeof filters.max_price === 'number' ? filters.max_price : parseFloat(filters.max_price);
        if(!Number.isNaN(maxPriceNum) && maxPriceNum >= 0){
            values.push(maxPriceNum);
            whereClauses.push(`l.price <= $${values.length}`);
        }
    }

    if(filters.search){
        values.push(`%${filters.search}%`);
        const searchIndex = values.length;
        whereClauses.push(`(
            l.title ILIKE $${searchIndex}
            OR l.description ILIKE $${searchIndex}
            OR l.brand ILIKE $${searchIndex}
        )`);
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

    // Debug logging
    console.log(' [Backend Model] Final SQL query:', query);
    console.log(' [Backend Model] Query values:', values);
    
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
export async function updateListing(id, title, description, category, brand, flex, hand, condition, price, status, photos, location) {
    const result = await pool.query(
        `UPDATE listings SET title = $1, description = $2, category = $3, brand = $4, flex = $5, hand = $6, condition = $7, price = $8, status = $9, photos = $10, location = $11
        WHERE listing_id = $12 RETURNING *`,
        [title, description, category, brand, flex, hand, condition, price, status, photos, location || null, id]
    );
    return result.rows[0];
}

export async function updateListingStatus(listing_id, user_id, status) {
    const result = await pool.query(
        `UPDATE listings SET status = $1
        WHERE listing_id = $2 AND user_id = $3
        RETURNING *`, [status, listing_id, user_id]
    );
    return result.rows[0];
}

//DELETES
export async function deleteListing(id) {
    const result = await pool.query(`DELETE FROM listings WHERE listing_id = $1 RETURNING *`, [id]);
    return result.rows[0];
}

//For recommendations
export async function getAllListingsExceptOwn(userId) {
    const result = await pool.query(
        `SELECT 
            l.*,
            u.name as seller_name,
            u.email as seller_email,
            u.profile_image as seller_profile_image
        FROM listings l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.user_id != $1 AND l.status = 'available'
        ORDER BY l.date_posted DESC`,
        [userId]
    );
    // Ensure photos are parsed as arrays if they're JSON/JSONB
    return result.rows.map(row => ({
        ...row,
        photos: row.photos ? (Array.isArray(row.photos) ? row.photos : JSON.parse(row.photos || '[]')) : []
    }));
}

export async function getAdminListingsQuery(search, category, condition, status, location){
    let query = 
        `SELECT l.*,
            u.name as seller_name, u.email as seller_email,
            (SELECT COUNT(*) FROM favorites f WHERE f.listing_id = l.listing_id) as total_saves
            FROM listings l
            LEFT JOIN users u ON l.user_id = u.id
            WHERE 1=1`;

    const params = [];
    let paramIndex = 1;

    //Filters
    if(category && category !== 'All Categories'){
        query += ` AND l.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
    }

    if(status && status !== 'All Status'){
        query += ` AND l.status = $${paramIndex}`;
        params.push(status.toLowerCase());
        paramIndex++;
    }

    if(search){
        query += ` AND (l.title ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR
        CAST(l.listing_id AS TEXT) ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
    }

    if(location && location !== 'All Locations'){
        query += ` AND l.location ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
    }

    query += ` ORDER BY l.created_at DESC`;
    
    const result = await pool.query(query, params);

    return result.rows.map(row => ({
        ...row,
        photos: row.photos ? (Array.isArray(row.photos) ? row.photos : JSON.parse(row.photos || '[]')) : []
    }));
}//End of getAdminListingsQuery method

