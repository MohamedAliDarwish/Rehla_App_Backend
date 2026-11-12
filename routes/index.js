const router = require("express").Router();

const authRoutes = require("./auth.routes");
const categoriesRoutes = require("./category.routes");
const tripRoutes = require("./trip.routes");
const favoriteRoutes = require("./favorite.routes");


router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/trips", tripRoutes);
router.use("/api/favorites", favoriteRoutes);

module.exports = router;
