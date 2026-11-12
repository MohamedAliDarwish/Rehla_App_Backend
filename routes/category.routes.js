// const express = require("express");
// const categoriesController = require("../controllers/category.controller");
// const protect = require("../middlewares/auth.middleware");
// const authorize = require("../middlewares/authorize.middleware");
// const router = express.Router();

// router.get("/", categoriesController.getAllCategories);
// // authorize('admin') ,
// router.post("/", protect, categoriesController.createCategory);

// module.exports = router;



const express = require("express");
const router = express.Router();

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    restoreCategory,
    toggleCategoryStatus,
} = require("../controllers/category.controller");

const authorize = require("../middlewares/authorize.middleware");
const protect = require("../middlewares/auth.middleware");

// Public
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);
router.patch("/:id/restore", protect, authorize("admin"), restoreCategory);
router.patch("/:id/toggle-status", protect, authorize("admin"), toggleCategoryStatus);

module.exports = router;
