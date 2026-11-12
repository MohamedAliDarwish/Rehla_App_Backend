const connectDB = require("../config/db");
const app = require("../app");

let dbPromise;

module.exports = async (req, res) => {
    try {
        if (!dbPromise) {
            dbPromise = connectDB();
        }

        await dbPromise;
        return app(req, res);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
};