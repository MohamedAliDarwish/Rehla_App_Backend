const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    nameAr: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      // /^[a-z0-9-]+$/,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Exclude deleted categories from normal find queries
categorySchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
