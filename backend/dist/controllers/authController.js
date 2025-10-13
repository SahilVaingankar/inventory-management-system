"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendResetOtp = exports.isAuthenticated = exports.verifyEmail = exports.sendVerifyOtp = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = require("../models/UserModel");
const DeviceModel_1 = require("../models/DeviceModel");
const uuid_1 = require("uuid");
const emailTemplates_1 = require("../config/emailTemplates");
const nodemailer_1 = require("../config/nodemailer");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing Details: username, email and password are required",
        });
    }
    try {
        const existingUser = yield UserModel_1.UserModel.findOne({ email });
        if (existingUser) {
            return res
                .status(409)
                .json({ success: false, message: "User already exists, please login" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new UserModel_1.UserModel({
            username,
            email,
            password: hashedPassword,
        });
        yield newUser.save();
        // -----------------------
        // AUTO LOGIN STARTS HERE
        // -----------------------
        const refreshToken = jsonwebtoken_1.default.sign({ id: newUser._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        const accessToken = jsonwebtoken_1.default.sign({ id: newUser._id, email }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const deviceId = (0, uuid_1.v4)();
        const deviceModel = new DeviceModel_1.DeviceModel({
            refreshToken,
            deviceId,
            email,
            userAgent: req.headers["user-agent"],
            ip: ((_a = req.headers["x-forwarded-for"]) === null || _a === void 0 ? void 0 : _a.split(",")[0]) ||
                req.socket.remoteAddress,
        });
        yield deviceModel.save();
        res.cookie("device_id", deviceId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
            maxAge: 15 * 60 * 1000,
        });
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to E-commerce website",
            html: `<h1>Welcome to E-commerce website. Your account has been created with email id: ${email}</h1>`,
        };
        console.log("sending email from", process.env.SENDER_EMAIL, "to", email);
        nodemailer_1.transporter.sendMail(mailOption).catch((err) => {
            console.error("Failed to send welcome email:", err);
        });
        return res.status(201).json({
            success: true,
            message: "Registration and login successful",
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(req);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing Details: email and password are required",
        });
    }
    try {
        // console.log(req);
        const user = yield UserModel_1.UserModel.findOne({ email });
        // console.log(user);
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid Email" });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        // console.log(isMatch);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid Password" });
        }
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        console.log(refreshToken);
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, email }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        console.log(accessToken);
        const deviceId = (0, uuid_1.v4)();
        console.log("id :", deviceId);
        const deviceModel = new DeviceModel_1.DeviceModel({
            refreshToken,
            deviceId,
            email,
            userAgent: req.headers["user-agent"],
            ip: ((_a = req.headers["x-forwarded-for"]) === null || _a === void 0 ? void 0 : _a.split(",")[0]) ||
                req.socket.remoteAddress,
        });
        yield deviceModel.save();
        console.log("data saved");
        res.cookie("device_id", deviceId, {
            httpOnly: true, // Not accessible via JS
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "E-commerce website",
            html: `<h1>devie ${req.headers["user-agent"]} Logged it to this Account</h1>`,
        };
        console.log("sending email from", process.env.SENDER_EMAIL, "to", email);
        nodemailer_1.transporter.sendMail(mailOption).catch((err) => {
            console.error("Failed to send welcome email:", err);
        });
        return res
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
            maxAge: 15 * 60 * 1000,
        })
            .status(200)
            .json({ success: true, message: "Login Successful", accessToken });
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deviceId = req.cookies.device_id;
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Missing device ID in cookies",
            });
        }
        yield DeviceModel_1.DeviceModel.deleteOne({ deviceId });
        res.clearCookie("device_id", {
            httpOnly: true, // Not accessible via JS
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
        });
        res
            .clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
        })
            .status(200)
            .json({ success: true, message: "Logout Successful" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.logout = logout;
const verifyJwt = (token, secret) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (_a) {
        return null;
    }
};
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { device_id } = req.cookies;
        if (!device_id) {
            return res.status(400).json({
                success: false,
                message: "Missing device ID in cookies",
            });
        }
        const device = yield DeviceModel_1.DeviceModel.findOne({ deviceId: device_id }).select("refreshToken deviceId email");
        if (!device) {
            return res.status(404).json({
                success: false,
                message: "Device not found",
            });
        }
        console.log(device);
        const { refreshToken, deviceId, email } = device;
        const payload = verifyJwt(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        if (!payload) {
            console.log("Invalid refresh token");
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const user = yield UserModel_1.UserModel.findOne({ email }).select("_id");
        console.log(user);
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        console.log(newRefreshToken);
        device.refreshToken = newRefreshToken;
        device.lastUsed = Date.now();
        yield device.save();
        console.log("token updated in the database");
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, email }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        console.log("new access token send");
        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
});
exports.refresh = refresh;
const sendVerifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield UserModel_1.UserModel.findById(userId);
        if (user.isAccountVerified) {
            res
                .status(409)
                .json({ success: false, message: "Account Already verified" });
            return;
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        yield user.save();
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account varification OTP",
            html: emailTemplates_1.PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{user}}", user.username),
        };
        yield nodemailer_1.transporter.sendMail(mailOption).catch((err) => {
            console.error("Failed to send verification email:", err);
        });
        res
            .status(200)
            .json({ success: true, message: "Verifiction OTP sent on your Email" });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
        return;
    }
});
exports.sendVerifyOtp = sendVerifyOtp;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const userId = req.userId;
    if (!userId || !otp) {
        res.status(400).json({ success: false, message: "Missing Details" });
        return;
    }
    try {
        const user = yield UserModel_1.UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            res.status(400).json({ success: false, message: "OTP Expired" });
            return;
        }
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;
        yield user.save();
        res
            .status(200)
            .json({ success: true, message: "Email verified successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.verifyEmail = verifyEmail;
const isAuthenticated = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ success: true, message: "Autenticated" });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        return;
    }
});
exports.isAuthenticated = isAuthenticated;
const sendResetOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(401).json({ success: false, message: "Email is required" });
        return;
    }
    try {
        const user = yield UserModel_1.UserModel.findOne({ email });
        if (!user) {
            res.status(401).json({ success: true, message: "User not found" });
            return;
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;
        yield user.save();
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            html: emailTemplates_1.PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{user}}", user.username),
        };
        yield nodemailer_1.transporter.sendMail(mailOption).catch((err) => {
            console.error("Failed to send verification email:", err);
        });
        res.status(200).json({ success: true, message: "OTP sent to your email" });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        return;
    }
});
exports.sendResetOtp = sendResetOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        res.status(400).json({
            success: false,
            message: "Email, OTP, and new password are required",
        });
        return;
    }
    try {
        const user = yield UserModel_1.UserModel.findOne({ email });
        if (!user) {
            res.status(401).json({ success: false, message: "User not found" });
            return;
        }
        if (!user.resetOtp || user.resetOtp !== otp) {
            res.status(401).json({ success: false, message: "Invalid OTP" });
            return;
        }
        if (user.resetOtpExpiresAt < Date.now()) {
            res.status(401).json({ success: false, message: "OTP Expired" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpiresAt = 0;
        yield user.save();
        res
            .status(200)
            .json({ success: true, message: "Password has been reset successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        return;
    }
});
exports.resetPassword = resetPassword;
