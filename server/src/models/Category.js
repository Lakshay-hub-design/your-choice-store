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
  }
);

categorySchema.index({
  slug: 1,
});

categorySchema.index({
  isFeatured: 1,
});

categorySchema.index({
  isActive: 1,
});

categorySchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
