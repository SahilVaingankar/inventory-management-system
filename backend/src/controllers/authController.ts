import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel";
import { DeviceModel } from "../models/DeviceModel";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { transporter } from "../config/nodemailer";
import { OrderModel } from "../models/OrderModel";
// import { ProductModel } from "../models/ProductModel";

import ProductModel from "../models/ProductModel";

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
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Store",
      html: `<h1>Welcome to Store. Your account has been created with email id: ${email}</h1>`,
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
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Store",
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
        sameSite: "none",
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
      sameSite: "none",
    });

    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
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
      sameSite: "none",
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

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // fetch the user from DB
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let orders;
    if (user.role === "staff" || user.role === "admin") {
      // staff/admin see all orders
      orders = await OrderModel.find()
        .populate("customerId", "name email") // ✅ corrected
        .populate("processedBy", "name email");
    } else {
      // user sees only their own orders
      orders = await OrderModel.find({ customerId: user._id }) // ✅ corrected
        .populate("customerId", "name email") // ✅ corrected
        .populate("processedBy", "name email");
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

// Request body interface
interface PlaceOrderRequestBody {
  customerName: string;
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  total: number;
}

// Define your controller normally with Request
export const postorders = async (
  req: Request<{}, {}, PlaceOrderRequestBody>,
  res: Response
) => {
  try {
    const userId = (req as any).userId; // get user ID from auth middleware
    const { customerName, items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const orderItems = items.map((item) => ({
      product: Number(item.product), // numeric ID
      productSnapshot: {
        name: "",
        category: "",
        price: item.price,
      },
      quantity: item.quantity ?? 1,
      price: item.price,
    }));

    const newOrder = new OrderModel({
      customerId: userId,
      customerName,
      items: orderItems,
      total,
    });

    const savedOrder = await newOrder.save();
    return res.status(201).json({ message: "Order placed", order: savedOrder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to place order", error });
  }
};

// Middleware should attach user info to req.user
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { action } = req.body; // "approve" or "reject"
    const orderId = req.params.id;

    const userId = req.userId; // populated by your auth middleware
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // fetch full user object
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user || user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden: staff only" });
    }

    const order = await OrderModel.findById(orderId);
    // console.log(order);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (action === "approve") {
      order.status = "approved";

      // console.log(order.items.product);
      for (const item of order.items) {
        if (item.product) {
          console.log("🔍 Looking for product:", item.product);

          // Step 1: Try finding the product by `id`
          const product = await ProductModel.findOne({ id: item.product });

          if (!product) {
            console.log(`❌ Product with id=${item.product} not found`);
            continue; // skip to next item
          }

          console.log(
            "✅ Found product:",
            product.name,
            "Remaining stock:",
            product.remainingStock
          );

          // Step 2: Update remainingStock manually
          const updatedStock = product.remainingStock - item.quantity;

          // Step 3: Update the document
          const updatedProduct = await ProductModel.findOneAndUpdate(
            { id: item.product },
            { remainingStock: updatedStock },
            { new: true }
          );

          console.log(
            "🆕 Updated product:",
            updatedProduct.name,
            "New remaining stock:",
            updatedProduct.remainingStock
          );
        }
      }
    } else if (action === "reject") {
      order.status = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    order.processedBy = user._id;
    await order.save();

    res.status(200).json({ message: `Order ${order.status}`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating order", error });
  }
};

// Admin-only: get all users
export const getUsers = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const users = await UserModel.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Admin-only: delete a user
export const deleteUser = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const targetUserId = req.params.id;
    await UserModel.findByIdAndDelete(targetUserId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Admin-only: add a product
export const addProduct = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const { id, name, price, category, remainingStock, inStock } = req.body;

    const newProduct = new ProductModel({
      id,
      name,
      price,
      category,
      remainingStock,
      inStock: inStock ?? true,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding product", error });
  }
};

// Admin-only: update a product
export const updateProduct = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const productId = req.params.id;
    const updates = req.body;

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updates,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res
      .status(200)
      .json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

// Admin-only: delete a product
export const deleteProduct = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const productId = req.params.id;
    await ProductModel.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product", error });
  }
};

export const getProducts = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const admin = await UserModel.findById(userId);
    if (!admin || admin.role !== "admin")
      return res.status(403).json({ message: "Forbidden: admin only" });

    const products = await ProductModel.find();
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};

// Add user (admin only)
export const addUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username: name,
      email,
      role,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "User added successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add user", error });
  }
};

// export const isAuthenticated = async (req: Request, res: Response) => {
//   try {
//     res.status(200).json({ success: true, message: "Autenticated" });
//     return;
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal server error" });
//     return;
//   }
// };
