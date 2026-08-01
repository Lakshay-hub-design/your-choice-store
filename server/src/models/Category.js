import mongoose from "mongoose";
import slugify from "slugify";
import imageSchema from "./common/image.schema.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    image: imageSchema,

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    seo: {
      metaTitle: {
        type: String,
        default: "",
      },
      metaDescription: {
        type: String,
        default: "",
      },
      keywords: [
        {
          type: String,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

categorySchema.index({
  slug: 1,
});

categorySchema.index({
  name: 1,
});

categorySchema.index({
  isActive: 1,
  isArchived: 1,
});

categorySchema.index({
  displayOrder: 1,
});

categorySchema.index({
  parentCategory: 1,
});

categorySchema.index({
  isFeatured: 1,
});

categorySchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

categorySchema.virtual("productCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
