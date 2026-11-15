
const mongoose = require('mongoose');

const Booking = require('../models/booking.model');
const Trip = require('../models/trip.model');

class BookingController {

    // Create Booking
    createBooking = async (req, res) => {
        try {
            const {
                tripId,
                numberOfSeats = 1,
                notes,
            } = req.body;

            const seats = Number(numberOfSeats);

            if (!tripId || !mongoose.isValidObjectId(tripId)) {
                return res.status(400).json({
                    success: false,
                    message: 'INVALID_TRIP_ID',
                });
            }

            if (!Number.isInteger(seats) || seats < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'INVALID_NUMBER_OF_SEATS',
                });
            }

            const trip = await Trip.findOne({
                _id: tripId,
                isDeleted: false,
            });

            if (!trip) {
                return res.status(404).json({
                    success: false,
                    message: 'TRIP_NOT_FOUND',
                });
            }

            if (trip.status !== 'published') {
                return res.status(400).json({
                    success: false,
                    message: 'TRIP_NOT_AVAILABLE_FOR_BOOKING',
                });
            }

            if (trip.availableSeats < seats) {
                return res.status(400).json({
                    success: false,
                    message: 'NOT_ENOUGH_SEATS',
                });
            }

            const existingBooking = await Booking.findOne({
                user: req.user._id,
                trip: tripId,
                status: {
                    $in: ['pending', 'approved'],
                },
            });

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    message: 'ALREADY_BOOKED',
                });
            }

            const totalPrice = trip.price * seats;

            // Reserve seats
            const updatedTrip = await Trip.findOneAndUpdate(
                {
                    _id: tripId,
                    isDeleted: false,
                    status: 'published',
                    availableSeats: {
                        $gte: seats,
                    },
                },
                {
                    $inc: {
                        availableSeats: -seats,
                    },
                },
                {
                    new: true,
                }
            );

            if (!updatedTrip) {
                return res.status(400).json({
                    success: false,
                    message: 'NOT_ENOUGH_SEATS',
                });
            }

            let booking;

            try {
                booking = await Booking.create({
                    user: req.user._id,
                    trip: tripId,
                    numberOfSeats: seats,
                    totalPrice,
                    notes,

                    tripSnapshot: {
                        title: trip.title,
                        coverImage: trip.coverImage,
                        origin: trip.origin,
                        destination: trip.destination,
                        startDate: trip.startDate,
                        endDate: trip.endDate,
                        pricePerSeat: trip.price,
                    },
                });

            } catch (error) {
                await Trip.updateOne(
                    { _id: tripId },
                    {
                        $inc: {
                            availableSeats: seats,
                        },
                    }
                );

                throw error;
            }

            await booking.populate([
                {
                    path: 'user',
                    select: 'fullName email phone profileImage',
                },
                {
                    path: 'trip',
                    select: 'title origin destination startDate endDate price coverImage status',
                },
            ]);

            // Notifications
            try {
                const notificationService = require('../services/notification.service');

                await notificationService.createNotification({
                    user: req.user._id,
                    title: 'طلب حجز جديد',
                    body: `تم تقديم طلب حجزك لرحلة (${trip.title}) بنجاح.`,
                    type: 'booking',
                    data: {
                        bookingId: booking._id,
                        tripId: trip._id,
                    },
                });

                await notificationService.notifyAdmins({
                    title: 'طلب حجز جديد',
                    body: `قام ${booking.user.fullName} بحجز ${seats} مقعد في رحلة (${trip.title}).`,
                    type: 'booking',
                    data: {
                        bookingId: booking._id,
                        tripId: trip._id,
                    },
                });

            } catch (error) {
                console.error('Notification Error:', error.message);
            }

            return res.status(201).json({
                success: true,
                message: 'BOOKING_CREATED',
                data: booking,
            });

        } catch (error) {
            console.error(error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'INTERNAL_SERVER_ERROR',
            });
        }
    };

    // My Bookings
    getMyBookings = async (req, res) => {
        try {
            const filter = {
                user: req.user._id,
            };

            if (req.query.status) {
                filter.status = req.query.status;
            }

            const bookings = await Booking.find(filter)
                .populate('trip')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: 'BOOKINGS_FETCHED',
                results: bookings.length,
                data: bookings,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: error.message || 'INTERNAL_SERVER_ERROR',
            });
        }
    };

    // All Bookings - Admin
    getAllBookings = async (req, res) => {
        try {
            const filter = {};

            if (req.query.status) {
                filter.status = req.query.status;
            }

            if (req.query.tripId) {
                filter.trip = req.query.tripId;
            }

            if (req.query.userId) {
                filter.user = req.query.userId;
            }

            const bookings = await Booking.find(filter)
                .populate('user', 'fullName email phone profileImage')
                .populate('trip')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: 'BOOKINGS_FETCHED',
                results: bookings.length,
                data: bookings,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: error.message || 'INTERNAL_SERVER_ERROR',
            });
        }
    };

    // Get Booking By ID
    getBookingById = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: 'INVALID_BOOKING_ID',
                });
            }

            const booking = await Booking.findById(req.params.id)
                .populate('user', 'fullName email phone profileImage')
                .populate('trip');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'BOOKING_NOT_FOUND',
                });
            }

            const isAdmin = req.user.role === 'admin';

            if (
                !isAdmin &&
                booking.user._id.toString() !== req.user._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'FORBIDDEN',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'BOOKING_FETCHED',
                data: booking,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: error.message || 'INTERNAL_SERVER_ERROR',
            });
        }
    };

    // Approve Booking
    approveBooking = async (req, res) => {
        try {
            const booking = await Booking.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'BOOKING_NOT_FOUND',
                });
            }

            if (booking.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'CANNOT_APPROVE_BOOKING',
                });
            }

            booking.status = 'approved';
            booking.approvedAt = new Date();

            await booking.save();

            return res.status(200).json({
                success: true,
                message: 'BOOKING_APPROVED',
                data: booking,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: error.message || 'INTERNAL_SERVER_ERROR',
            });
        }
    };

    // Reject Booking
    rejectBooking = async (req, res) => {
        try {
            const booking = await Booking.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'BOOKING_NOT_FOUND',
                });
            }

            if (['rejected', 'cancelled'].includes(booking.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'CANNOT_REJECT_BOOKING',
                });
            }

            if (booking.status === 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'APPROVED_BOOKING_CANNOT_BE_REJECTED',
                });
            }

            const trip = await Trip.findById(booking.trip);

            if (trip) {
                await Trip.updateOne(
                    { _id: trip._id },
                    {
                        $inc: {
                            availableSeats: booking.numberOfSeats,
                        },
                    }
                );
            }

            booking.status = 'rejected';
            booking.rejectionReason = req.body.rejectionReason || '';
            booking.rejectedAt = new Date();

            await booking.save();

            return res.status(200).json({
                success: true,
                message: 'BOOKING_REJECTED',
                data: booking,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: error.message || 'INTERNAL_SERVER_ERROR',
            });
        }
    };

    // Cancel Booking
    cancelBooking = async (req, res) => {
        try {
            const booking = await Booking.findById(req.params.id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'BOOKING_NOT_FOUND',
                });
            }

            const isAdmin = req.user.role === 'admin';

            if (
                !isAdmin &&
                booking.user.toString() !== req.user._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'FORBIDDEN',
                });
            }

            if (['cancelled', 'rejected'].includes(booking.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'CANNOT_CANCEL_BOOKING',
                });
            }

            const trip = await Trip.findById(booking.trip);

            if (trip) {
                await Trip.updateOne(
                    { _id: trip._id },
                    {
                        $inc: {
                            availableSeats: booking.numberOfSeats,
                        },
                    }
                );
            }

            booking.status = 'cancelled';
            booking.cancelledBy = isAdmin ? 'admin' : 'user';
            booking.cancellationReason =
                req.body.cancellationReason || '';
            booking.cancelledAt = new Date();

            await booking.save();

            return res.status(200).json({
                success: true,
                message: 'BOOKING_CANCELLED',
                data: booking,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: error.message || 'INTERNAL_SERVER_ERROR',
            });
        }
    };
}

module.exports = new BookingController();
