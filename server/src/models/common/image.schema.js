import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

export default imageSchema;
