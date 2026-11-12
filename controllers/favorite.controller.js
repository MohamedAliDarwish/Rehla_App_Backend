
const mongoose = require("mongoose");
const Favorite = require("../models/favorite.model");
const Trip = require("../models/trip.model");

const isValidId = (id) => mongoose.isValidObjectId(id);

// 1. Add Trip To Favorites
const addFavorite = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        if (!isValidId(tripId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid trip ID",
            });
        }

        // Check if trip exists, is not deleted, and is published
        const trip = await Trip.findOne({
            _id: tripId,
            status: "published",
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found or not available",
            });
        }

        // Check existing favorite
        const existingFavorite = await Favorite.findOne({
            user: userId,
            trip: tripId,
        });

        if (existingFavorite) {
            return res.status(409).json({
                success: false,
                message: "Trip already exists in favorites",
            });
        }

        const favorite = await Favorite.create({
            user: userId,
            trip: tripId,
        });

        return res.status(201).json({
            success: true,
            message: "Trip added to favorites successfully",
            data: favorite,
        });
    } catch (error) {
        console.error("Add Favorite Error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Trip already exists in favorites",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to add trip to favorites",
        });
    }
};

// 2. Remove Trip From Favorites
const removeFavorite = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        if (!isValidId(tripId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid trip ID",
            });
        }

        const favorite = await Favorite.findOneAndDelete({
            user: userId,
            trip: tripId,
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: "Favorite not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Trip removed from favorites successfully",
        });
    } catch (error) {
        console.error("Remove Favorite Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove trip from favorites",
        });
    }
};

// 3. Get User Favorites
const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        const favorites = await Favorite.find({
            user: userId,
        })
            .populate({
                path: "trip",
                match: {
                    status: "published",
                },
                populate: {
                    path: "category",
                    select: "nameEn nameAr slug image",
                },
            })
            .sort({ createdAt: -1 })
            .lean();

        // Exclude deleted or unpublished trips
        const availableFavorites = favorites.filter(
            (favorite) => favorite.trip !== null
        );

        return res.status(200).json({
            success: true,
            results: availableFavorites.length,
            data: availableFavorites,
        });
    } catch (error) {
        console.error("Get Favorites Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve favorites",
        });
    }
};

// 4. Check If Trip Is Favorite
const checkFavorite = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        if (!isValidId(tripId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid trip ID",
            });
        }

        const favorite = await Favorite.findOne({
            user: userId,
            trip: tripId,
        });

        return res.status(200).json({
            success: true,
            isFavorite: !!favorite,
        });
    } catch (error) {
        console.error("Check Favorite Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to check favorite",
        });
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavorite,
};
