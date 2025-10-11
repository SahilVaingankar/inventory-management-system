import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel";
import { DeviceModel } from "../models/DeviceModel";
import { v4 as uuidv4 } from "uuid";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates";
import { Request, Response } from "express";
import { transporter } from "../config/nodemailer";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing Details: username, email and password are required",
    });
  }

  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists, please login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // -----------------------
    // AUTO LOGIN STARTS HERE
    // -----------------------

    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    const accessToken = jwt.sign(
      { id: newUser._id, email },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    const deviceId = uuidv4();

    const deviceModel = new DeviceModel({
      refreshToken,
      deviceId,
      email,
      userAgent: req.headers["user-agent"],
      ip:
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress,
    });

    await deviceModel.save();

    res.cookie("device_id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 15 * 60 * 1000,
    });

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to E-commerce website",
      html: `<h1>Welcome to E-commerce website. Your account has been created with email id: ${email}</h1>`,
    };

    console.log("sending email to", email);

    transporter.sendMail(mailOption).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    return res.status(201).json({
      success: true,
      message: "Registration and login successful",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing Details: email and password are required",
    });
  }
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password" });
    }

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    const accessToken = jwt.sign(
      { id: user._id, email },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    const deviceId = uuidv4();

    const deviceModel = new DeviceModel({
      refreshToken,
      deviceId,
      email,
      userAgent: req.headers["user-agent"],
      ip:
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress,
    });

    await deviceModel.save();

    console.log("user data saved on databse successfully");

    res.cookie("device_id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "E-commerce website",
      html: `<h1>devie ${req.headers["user-agent"]} Logged it to this Account</h1>`,
    };

    console.log("sending email to", email);

    transporter.sendMail(mailOption).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({ success: true, message: "Login Successful", accessToken });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const deviceId = req.cookies.device_id;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing device ID in cookies",
      });
    }

    await DeviceModel.deleteOne({ deviceId });

    res.clearCookie("device_id", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .status(200)
      .json({ success: true, message: "Logout Successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const verifyJwt = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { device_id } = req.cookies;

    if (!device_id) {
      return res.status(400).json({
        success: false,
        message: "Missing device ID in cookies",
      });
    }

    const device = await DeviceModel.findOne({ deviceId: device_id }).select(
      "refreshToken deviceId email"
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const { refreshToken, email } = device;

    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    const payload = verifyJwt(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    );
    if (!payload) {
      console.log("Invalid refresh token");

      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const user = await UserModel.findOne({ email }).select("_id");

    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    device.refreshToken = newRefreshToken;
    device.lastUsed = new Date();
    await device.save();

    console.log("token updated in the database");

    const accessToken = jwt.sign(
      { id: user._id, email },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 15 * 60 * 1000,
    });

    console.log("new access token send");

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const sendVerifyOtp = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.userId;
    const user = await UserModel.findById(userId);

    if (user.isAccountVerified) {
      res
        .status(409)
        .json({ success: false, message: "Account Already verified" });
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account varification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{user}}",
        user.username
      ),
    };

    await transporter.sendMail(mailOption).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    res
      .status(200)
      .json({ success: true, message: "Verifiction OTP sent on your Email" });
    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

export const verifyEmail = async (req: AuthenticatedRequest, res: Response) => {
  const { otp } = req.body;
  const userId = req.userId;

  if (!userId || !otp) {
    res.status(400).json({ success: false, message: "Missing Details" });
    return;
  }
  try {
    const user = await UserModel.findById(userId);

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

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const isAuthenticated = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true, message: "Autenticated" });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

export const sendResetOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(401).json({ success: false, message: "Email is required" });
    return;
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ success: true, message: "User not found" });
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{user}}",
        user.username
      ),
    };

    await transporter.sendMail(mailOption).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    res.status(200).json({ success: true, message: "OTP sent to your email" });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiresAt = 0;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password has been reset successfully" });

    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};
