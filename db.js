const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Function to save tracking data to MySQL
const saveTrackingData = async (type, details) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.execute(
            "INSERT INTO tracking_data (type, details) VALUES (?, ?)",
            [type, JSON.stringify(details)]
        );
        console.log("Data saved to MySQL:", { type, details });
    } catch (err) {
        console.error("Error saving data to MySQL:", err.message);
        throw new Error("Failed to save tracking data to the database");
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { saveTrackingData };
