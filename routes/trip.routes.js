// const router = require("express").Router();
// const tripController = require("../controllers/trip.controller");
// const authorize = require("../middlewares/authorize.middleware");
// /*
// @uri /api/v1/trips/
// @endpoint /
// @description create New trips
// @Access Admin
// @method POST
// */
// // authorize("admin"),
// router.post("/", tripController.createTrip);

// /*
// @uri /api/v1/trip/
// @endpoint /
// @description Get All Trips
// @Access Public
// @method Get
// */

// router.get("/", tripController.getAllTrips);

// module.exports = router;




const express = require("express");
const authorize = require("../middlewares/authorize.middleware");
const protect = require("../middlewares/auth.middleware");
const router = express.Router();

const {
    createTrip,
    getAllTrips,
    getTripById,
    searchTrips,
    getTripsByCategory,
    updateTrip,
    deleteTrip,
getAllTripsAdmin,
} = require("../controllers/trip.controller");

// استبدل أسماء الـ Middleware بأسماء الملفات الموجودة عندك

// Public Routes
router.get("/", getAllTrips);
router.get("/search", searchTrips);
router.get("/category/:categoryId", getTripsByCategory);
router.get("/:id", getTripById);

// Admin Routes
router.get("/admin/all/trips",protect,authorize("admin"),getAllTripsAdmin);
router.post("/", protect, authorize("admin"), createTrip);
router.put("/:id", protect, authorize("admin"), updateTrip);
router.delete("/:id", protect, authorize("admin"), deleteTrip);

module.exports = router;
