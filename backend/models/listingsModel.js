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
    let query = `SELECT * FROM listings`;
    const values = [];
    const whereClauses = [];

    if(filters.category){
        values.push(filters.category);
        whereClauses.push(`category = $${values.length}`);
    }

    if(filters.user_id){
        values.push(filters.user_id);
        whereClauses.push(`user_id = $${values.length}`);
    }

    if(filters.status){
        values.push(filters.status);
        whereClauses.push(`status = $${values.length}`);
    }

    if(whereClauses.length > 0){
        query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    if(sort === "newest"){
        query += ` ORDER BY created_at DESC`;
    }else if (sort === "oldest"){
        query += ` ORDER BY created_at ASC`;
    }else if(sort === "price_low_high"){
        query += ` ORDER BY price ASC`;
    }else if(sort === "price_high_low"){
        query += ` ORDER BY price DESC`;
    }

    const result = await pool.query(query, values);
    return result.rows;

}

export async function getListingById(id) {
    const result = await pool.query(
        `SELECT * FROM listings WHERE listing_id = $1`, [id]
    );
    return result.rows[0];
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

//DELETES
export async function deleteListing(id) {
    const result = await pool.query(`DELETE FROM listings WHERE listing_id = $1 RETURNING *`, [id]);
    return result.rows[0];
}
