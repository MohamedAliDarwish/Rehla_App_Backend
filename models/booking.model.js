
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
            default: 1,
            min: 1,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        tripSnapshot: {
            title: { type: String, required: true },
            coverImage: { type: String, default: '' },
            origin: { type: String, required: true },
            destination: { type: String, required: true },
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            pricePerSeat: { type: Number, required: true },
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
        },
        notes: { type: String, default: '' },
        rejectionReason: { type: String, default: '' },
        cancellationReason: { type: String, default: '' },
        cancelledBy: {
            type: String,
            enum: ['user', 'admin'],
        },
        approvedAt: Date,
        rejectedAt: Date,
        cancelledAt: Date,
        isProtected: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
