const mongoose = require("mongoose");
const Category = require("../models/category.model");
const Trip = require("../models/trip.model");

// Escape search input before using RegExp
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 1. Create Category // admin only
const createCategory = async (req, res) => {
  try {
    const { nameEn, nameAr, slug, image } = req.body;

    const category = await Category.create({
      nameEn,
      nameAr,
      slug,
      image,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// 2. Get All Active Categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isDeleted: false,
      isActive: true,
    }).sort({ nameEn: 1 });

    return res.status(200).json({
      success: true,
      results: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
};

// // 3. Get Category By ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findOne({
      _id: id,
      isDeleted: false,
      isActive: true,
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
    });
  }
};

// 4. Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const allowedFields = ["nameEn", "nameAr", "slug", "image", "isActive"];

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

    const category = await Category.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// 5. Soft Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          isActive: false,
        },
      },
      {
        new: true,
      },
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Existing trips are intentionally preserved.
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

// 6. Restore Category
const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findOneAndUpdate(
      {
        _id: id,
        isDeleted: true,
      },
      {
        $set: {
          isDeleted: false,
          isActive: true,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Deleted category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category restored successfully",
      data: category,
    });
  } catch (error) {
    console.error("Restore Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restore category",
    });
  }
};

// 7. Toggle Category Status
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;

    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      data: category,
    });
  } catch (error) {
    console.error("Toggle Category Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  restoreCategory,
  toggleCategoryStatus,
};
