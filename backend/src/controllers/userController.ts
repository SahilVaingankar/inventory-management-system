import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import ProductModel from "../models/ProductModel";

interface AuthenticatedRequest extends Request {
  userId: string;
}

export const getUserData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req;

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      userData: {
        name: user.username,
        role: user.role,
      },
    });
    console.log("data sent to frontend successfully");
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

export const getProductData = async (req: Request, res: Response) => {
  try {
    // Logic to fetch product data from the database
    const products = await ProductModel.find(); // Assuming ProductModel is defined and imported
    res.status(200).json({
      success: true,
      products, // send the array of products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    // Logic to fetch product data from the database
    const products = await ProductModel.find({ id: req.params.id }); // Assuming ProductModel is defined and imported

    res.status(200).json({
      success: true,
      products, // send the array of products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};
