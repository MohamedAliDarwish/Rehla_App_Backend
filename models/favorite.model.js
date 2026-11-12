const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate favorites for the same user and trip
favoriteSchema.index(
    { user: 1, trip: 1 },
    { unique: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
