import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { USER_ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    avatar: {
      fileId: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      select: false,
    },

    verificationTokenExpires: {
      type: Date,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    lastVerificationEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

userSchema.index({ role: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
  return;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
