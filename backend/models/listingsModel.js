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
export async function getAllListings(){
    const allListings = await pool.query(`SELECT * FROM listings`);
    return allListings.rows;
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
