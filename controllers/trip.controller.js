
const mongoose = require("mongoose");
const Trip = require("../models/trip.model");
const Category = require("../models/category.model");

// Helpers
const isValidId = (id) => mongoose.isValidObjectId(id);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateCategory = async (categoryId) => {
  if (!isValidId(categoryId)) return false;

  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
    isDeleted: false,
  });

  return !!category;
};

// 1. Create Trip - Admin
const createTrip = async (req, res) => {
  try {
    const {
      title,
      description,
      from,
      destination,
      price,
      capacity,
      startDate,
      endDate,
      category,
      status,
      coverImage,
      gallery,
      included,
      excluded,
      cancelPolicy,
      days,
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      !startDate ||
      !endDate ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start >= end
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip dates. Start date must be before end date",
      });
    }

    if (category && !(await validateCategory(category))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category",
      });
    }

    const trip = await Trip.create({
      title,
      description,
      from,
      destination,
      price,
      capacity,
      availableSeats: capacity,
      startDate,
      endDate,
      category,
      status,
      coverImage,
      gallery,
      included,
      excluded,
      cancelPolicy,
      days,
    });

    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: trip,
    });
  } catch (error) {
    console.error("Create Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create trip",
    });
  }
};

// 2. Get All Published Trips - Public
const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      status: "published",
    })
      .populate("category", "nameEn nameAr slug image")
      .sort({ startDate: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      results: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Get Trips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve trips",
    });
  }
};


// get all trips Admin
const getAllTripsAdmin = async (req, res) => {
  try {
    const trips = await Trip.find({
    })
      .populate("category", "nameEn nameAr slug image")
      .sort({ startDate: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      results: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Get Trips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve trips",
    });
  }
};


// 3. Get Trip By ID - Public
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findOne({
      _id: id,
      status: "published",
    })
      .populate("category", "nameEn nameAr slug image")
      .lean();

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error("Get Trip By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve trip",
    });
  }
};

// 4. Search Trips By Title - Public
const searchTrips = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search keyword",
      });
    }

    const safeKeyword = escapeRegex(keyword.trim());

    const trips = await Trip.find({
      status: "published",
      title: {
        $regex: safeKeyword,
        $options: "i",
      },
    })
      .populate("category", "nameEn nameAr slug image")
      .sort({ startDate: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      results: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Search Trips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search trips",
    });
  }
};

// 5. Get Trips By Category - Public
const getTripsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!isValidId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      isActive: true,
      isDeleted: false,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const trips = await Trip.find({
      category: categoryId,
      status: "published",
    })
      .populate("category", "nameEn nameAr slug image")
      .sort({ startDate: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      results: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Get Trips By Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve trips by category",
    });
  }
};

// 6. Update Trip - Admin
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "from",
      "destination",
      "price",
      "capacity",
      "startDate",
      "endDate",
      "category",
      "status",
      "coverImage",
      "gallery",
      "included",
      "excluded",
      "cancelPolicy",
      "days",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (
      updates.category &&
      !(await validateCategory(updates.category))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category",
      });
    }

    const startDate = new Date(updates.startDate ?? trip.startDate);
    const endDate = new Date(updates.endDate ?? trip.endDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    if (updates.capacity !== undefined) {
      const bookedSeats = trip.capacity - trip.availableSeats;

      if (
        !Number.isFinite(Number(updates.capacity)) ||
        Number(updates.capacity) < bookedSeats
      ) {
        return res.status(400).json({
          success: false,
          message: "Capacity cannot be lower than booked seats",
        });
      }

      updates.availableSeats =
        Number(updates.capacity) - bookedSeats;
    }

    Object.assign(trip, updates);

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: trip,
    });
  } catch (error) {
    console.error("Update Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update trip",
    });
  }
};

// 7. Delete Trip - Admin (Soft Delete)
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      {
        $set: { isDeleted: true },
      },
      {
        new: true,
      }
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Delete Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete trip",
    });
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  searchTrips,
  getTripsByCategory,
  updateTrip,
  deleteTrip,
};
