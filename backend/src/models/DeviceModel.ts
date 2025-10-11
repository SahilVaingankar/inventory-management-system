import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  refreshToken: { type: String },
  deviceId: { type: String },
  email: { type: String },
  userAgent: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: Date.now, index: { expires: "7d" } },
});

export const DeviceModel =
  mongoose.models.Device || mongoose.model("Device", DeviceSchema);
