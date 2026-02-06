import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true },

    eventType: {
      type: String,
      enum: ["SIGNUP", "LOGIN"],
      required: true,
    },

    email: { type: String, required: true },

    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "DLQ"],
      default: "PENDING",
    },

    attempts: { type: Number, default: 0 },

    provider: { type: String, default: "Brevo" },

    error: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("NotificationLog", notificationLogSchema);
