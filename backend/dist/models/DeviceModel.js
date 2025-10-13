"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DeviceSchema = new mongoose_1.default.Schema({
    refreshToken: { type: String },
    deviceId: { type: String },
    email: { type: String },
    userAgent: String,
    ip: String,
    createdAt: { type: Date, default: Date.now },
    lastUsed: { type: Date, default: Date.now, index: { expires: "2m" } },
});
exports.DeviceModel = mongoose_1.default.models.device || mongoose_1.default.model("device", DeviceSchema);
