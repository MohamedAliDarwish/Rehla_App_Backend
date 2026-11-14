
const express = require("express");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavorite,
} = require("../controllers/favorite.controller");

const router = express.Router();

// All routes require authentication and user role
router.use(protect, authorize("user"));

// Get all favorites
router.get("/", protect, getFavorites);

// Check if trip is favorite
router.get("/:tripId", protect, checkFavorite);

// Add favorite
router.post("/:tripId", protect, addFavorite);

// Remove favorite
router.delete("/:tripId", protect, removeFavorite);

module.exports = router;


/*



7. اختبار الـ API
استخدم Postman مع Bearer Token الخاص بمستخدم عادي.

العملية

Request

عرض المفضلة

GET /api/favorites

إضافة رحلة

POST /api/favorites/TRIP_ID

حذف رحلة

DELETE /api/favorites/TRIP_ID

التحقق

GET /api/favorites/TRIP_ID

*/