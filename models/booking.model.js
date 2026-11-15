
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },

        numberOfSeats: {
            type: Number,
            required: true,
            min: 1,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        notes: {
            type: String,
            trim: true,
            default: '',
        },

        status: {
            type: String,
            enum: [
                'pending',
                'approved',
                'rejected',
                'cancelled',
            ],
            default: 'pending',
        },

        tripSnapshot: {
            title: String,
            coverImage: String,
            origin: String,
            destination: String,
            startDate: Date,
            endDate: Date,
            pricePerSeat: Number,
        },

        approvedAt: {
            type: Date,
            default: null,
        },

        rejectedAt: {
            type: Date,
            default: null,
        },

        rejectionReason: {
            type: String,
            default: '',
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        cancelledBy: {
            type: String,
            enum: ['user', 'admin'],
        },

        cancellationReason: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ trip: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
