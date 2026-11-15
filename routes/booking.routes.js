
const express = require('express');
const bookingController = require('../controllers/booking.controller');

const authorize = require("../middlewares/authorize.middleware");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

// User
router.post('/', bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/cancel', bookingController.cancelBooking);

// Admin
router.get('/', authorize('admin'), bookingController.getAllBookings);
router.patch('/:id/approve', authorize('admin'), bookingController.approveBooking);
router.patch('/:id/reject', authorize('admin'), bookingController.rejectBooking);

module.exports = router;
