"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const userAuth_1 = require("../middleware/userAuth");
exports.authRouter = (0, express_1.default)();
exports.authRouter.post("/register", authController_1.register);
exports.authRouter.post("/login", authController_1.login);
exports.authRouter.post("/logout", authController_1.logout);
exports.authRouter.post("/refresh", authController_1.refresh);
exports.authRouter.post("/send-verify-otp", userAuth_1.userAuth, authController_1.sendVerifyOtp);
exports.authRouter.post("/verify-account", userAuth_1.userAuth, authController_1.verifyEmail);
exports.authRouter.get("/is-auth", userAuth_1.userAuth, authController_1.isAuthenticated);
exports.authRouter.post("/send-reset-otp", authController_1.sendResetOtp);
exports.authRouter.post("/reset-password", authController_1.resetPassword);
