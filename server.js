const WebSocket = require("ws");
const { saveTrackingData } = require("./db");
require("dotenv").config();

// Validate environment variables
["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"].forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Environment variable ${varName} is missing`);
    }
});

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket server is running on ws://localhost:8080");

// Graceful shutdown
const shutdown = async () => {
    console.log("Shutting down...");
    wss.close(() => console.log("WebSocket server closed"));
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Handle client connections
wss.on("connection", (ws) => {
    console.log("New client connected");

    // Send a welcome message
    ws.send("Welcome to the WebSocket server!");

    ws.on("message", async (message) => {
        console.log("Received:", message);

        try {
            // Parse and validate data
            const data = JSON.parse(message);

            if (!data.type || typeof data.type !== "string") {
                throw new Error("Invalid or missing 'type'");
            }
            if (!data.details || typeof data.details !== "object") {
                throw new Error("Invalid or missing 'details'");
            }

            // Save to the database
            await saveTrackingData(data.type, data.details);

            // Acknowledge success
            ws.send(JSON.stringify({ status: "success", message: "Data saved successfully" }));
        } catch (err) {
            console.error("Error processing data:", err.message);
            ws.send(JSON.stringify({ status: "error", message: err.message }));
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});
