const router = require("express").Router();

const authRoutes = require("./auth.routes");
const categoriesRoutes = require("./category.routes");
const tripRoutes = require("./trip.routes");
const favoriteRoutes = require("./favorite.routes");
const bookingRoutes = require("./booking.routes");


router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/trips", tripRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/booking", bookingRoutes);

module.exports = router;
