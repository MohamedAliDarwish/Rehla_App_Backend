
const Booking = require('../models/booking.model');
const Trip = require('../models/trip.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const AsyncHandler = require('../utils/AsyncHandler');
const { getPagination, getPagingData } = require('../utils/pagination.util');

class BookingController {

    // Create Booking
    createBooking = AsyncHandler(async (req, res) => {
        const { tripId, numberOfSeats = 1, notes, couponCode, isProtected } = req.body;

        const seats = Number(numberOfSeats);

        if (!Number.isInteger(seats) || seats < 1) {
            throw new ApiError(400, 'INVALID_NUMBER_OF_SEATS');
        }

        const trip = await Trip.findOne({
            _id: tripId,
            isDeleted: false,
        });

        if (!trip) throw new ApiError(404, 'TRIP_NOT_FOUND');

        if (trip.status !== 'published') {
            throw new ApiError(400, 'TRIP_NOT_AVAILABLE_FOR_BOOKING');
        }

        if (trip.availableSeats < seats) {
            throw new ApiError(400, 'NOT_ENOUGH_SEATS');
        }

        const existingBooking = await Booking.findOne({
            user: req.user._id,
            trip: tripId,
            status: { $in: ['pending', 'approved'] },
        });

        if (existingBooking) {
            throw new ApiError(400, 'ALREADY_BOOKED');
        }

        let totalPrice = trip.price * seats;

        if (couponCode) {
            const couponService = require('../services/coupon.service');
            const result = await couponService.validateCoupon(couponCode, totalPrice);
            totalPrice = result.finalPrice;
            await result.coupon.updateOne({ $inc: { usedCount: 1 } });
        }

        const booking = await Booking.create({
            user: req.user._id,
            trip: tripId,
            numberOfSeats: seats,
            totalPrice,
            notes,
            isProtected:
                req.user.isProtected ||
                req.user.role === 'admin' ||
                isProtected === true ||
                isProtected === 'true',
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

        trip.availableSeats -= seats;
        await trip.save();

        await booking.populate([
            { path: 'user', select: 'fullName email phone profileImage' },
            { path: 'trip', select: 'title origin destination startDate endDate price coverImage status' },
        ]);

        try {
            const notificationService = require('../services/notification.service');

            await notificationService.createNotification({
                user: req.user._id,
                title: 'طلب حجز جديد',
                body: `تم تقديم طلب حجزك لرحلة (${trip.title}) بنجاح.`,
                type: 'booking',
                data: { bookingId: booking._id, tripId: trip._id },
                isProtected: booking.isProtected,
            });

            await notificationService.notifyAdmins({
                title: 'طلب حجز جديد',
                body: `قام ${booking.user.fullName} بحجز ${seats} مقعد في رحلة (${trip.title}).`,
                type: 'booking',
                data: { bookingId: booking._id, tripId: trip._id },
                isProtected: booking.isProtected,
            });
        } catch (error) {
            console.error(error.message);
        }

        res.status(201).json(
            new ApiResponse(201, 'BOOKING_CREATED', booking, req.lang)
        );
    });

    // My Bookings
    getMyBookings = AsyncHandler(async (req, res) => {
        const { page, limit, skip } = getPagination(req.query);

        const filter = { user: req.user._id };

        if (req.query.status) filter.status = req.query.status;

        const bookings = await Booking.find(filter)
            .populate('trip')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments(filter);

        res.status(200).json(
            new ApiResponse(
                200,
                'BOOKINGS_FETCHED',
                getPagingData(bookings, total, page, limit, 'bookings'),
                req.lang
            )
        );
    });

    // All Bookings - Admin
    getAllBookings = AsyncHandler(async (req, res) => {
        const { page, limit, skip } = getPagination(req.query);

        const filter = {};

        if (req.query.status) filter.status = req.query.status;
        if (req.query.tripId) filter.trip = req.query.tripId;
        if (req.query.userId) filter.user = req.query.userId;

        const bookings = await Booking.find(filter)
            .populate('user', 'fullName email phone profileImage')
            .populate('trip')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments(filter);

        res.status(200).json(
            new ApiResponse(
                200,
                'BOOKINGS_FETCHED',
                getPagingData(bookings, total, page, limit, 'bookings'),
                req.lang
            )
        );
    });

    // Get Booking By ID
    getBookingById = AsyncHandler(async (req, res) => {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'fullName email phone profileImage')
            .populate('trip');

        if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND');

        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && booking.user._id.toString() !== req.user._id.toString()) {
            throw new ApiError(403, 'FORBIDDEN');
        }

        res.status(200).json(
            new ApiResponse(200, 'BOOKING_FETCHED', booking, req.lang)
        );
    });

    // Approve Booking
    approveBooking = AsyncHandler(async (req, res) => {
        const booking = await Booking.findById(req.params.id);

        if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND');

        if (booking.status !== 'pending') {
            throw new ApiError(400, 'CANNOT_APPROVE_BOOKING');
        }

        booking.status = 'approved';
        booking.approvedAt = new Date();

        await booking.save();

        res.status(200).json(
            new ApiResponse(200, 'BOOKING_APPROVED', booking, req.lang)
        );
    });

    // Reject Booking
    rejectBooking = AsyncHandler(async (req, res) => {
        const booking = await Booking.findById(req.params.id);

        if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND');

        if (['rejected', 'cancelled'].includes(booking.status)) {
            throw new ApiError(400, 'CANNOT_REJECT_BOOKING');
        }

        const trip = await Trip.findById(booking.trip);

        if (trip) {
            trip.availableSeats += booking.numberOfSeats;
            await trip.save();
        }

        booking.status = 'rejected';
        booking.rejectionReason = req.body.rejectionReason || '';
        booking.rejectedAt = new Date();

        await booking.save();

        res.status(200).json(
            new ApiResponse(200, 'BOOKING_REJECTED', booking, req.lang)
        );
    });

    // Cancel Booking
    cancelBooking = AsyncHandler(async (req, res) => {
        const booking = await Booking.findById(req.params.id);

        if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND');

        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && booking.user.toString() !== req.user._id.toString()) {
            throw new ApiError(403, 'FORBIDDEN');
        }

        if (['cancelled', 'rejected'].includes(booking.status)) {
            throw new ApiError(400, 'CANNOT_CANCEL_BOOKING');
        }

        const trip = await Trip.findById(booking.trip);

        if (trip) {
            trip.availableSeats += booking.numberOfSeats;
            await trip.save();
        }

        booking.status = 'cancelled';
        booking.cancelledBy = isAdmin ? 'admin' : 'user';
        booking.cancellationReason = req.body.cancellationReason || '';
        booking.cancelledAt = new Date();

        await booking.save();

        res.status(200).json(
            new ApiResponse(200, 'BOOKING_CANCELLED', booking, req.lang)
        );
    });
}

module.exports = new BookingController();
