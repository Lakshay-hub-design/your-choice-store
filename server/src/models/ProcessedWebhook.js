import mongoose from "mongoose";

const processedWebhookSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    event: {
      type: String,
      required: true,
    },

    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ProcessedWebhook = mongoose.model("ProcessedWebhook", processedWebhookSchema);

export default ProcessedWebhook;
