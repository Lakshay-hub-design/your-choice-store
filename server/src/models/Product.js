import mongoose from "mongoose";
import slugify from "slugify";
import imageSchema from "./common/image.schema.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      maxlength: 250,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    productType: {
      type: String,
      enum: ["gift", "toy"],
      required: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    comparePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      rate: {
        type: Number,
        required: true,
        enum: [0, 3, 5, 12, 18, 28],
      },
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Reserved stock must be a whole number",
      },
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Low stock threshold must be a whole number",
      },
    },

    sold: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Sold quantity must be a whole number",
      },
    },

    images: {
      type: [imageSchema],
      validate: {
        validator: (images) => images.length > 0,
        message: "At least one product image is required",
      },
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    customization: {
      enabled: {
        type: Boolean,
        default: false,
      },

      allowText: {
        type: Boolean,
        default: false,
      },

      allowImage: {
        type: Boolean,
        default: false,
      },

      maxImages: {
        type: Number,
        default: 1,
        min: 1,
      },

      instructions: {
        type: String,
        default: "",
      },
    },

    shipping: {
      weight: {
        type: Number,
        required: true,
        min: 0.001,
      },

      dimensions: {
        length: {
          type: Number,
          required: true,
          min: 0.1,
        },

        breadth: {
          type: Number,
          required: true,
          min: 0.1,
        },

        height: {
          type: Number,
          required: true,
          min: 0.1,
        },
      },
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
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
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  const baseSlug =
    slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    }) || "product";

  let candidateSlug = baseSlug;
  let counter = 1;

  while (
    await this.constructor.exists({
      _id: { $ne: this._id },
      slug: candidateSlug,
    })
  ) {
    candidateSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  this.slug = candidateSlug;
});

productSchema.index({ category: 1 });

productSchema.index({ price: 1 });

productSchema.index({ isFeatured: 1 });

productSchema.index({ isBestSeller: 1 });

productSchema.index({ isActive: 1 });

productSchema.index({ tags: 1 });

productSchema.index({ isArchived: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
