import { Router } from "express";
import {
  getProduct,
  getProductData,
  getUserData,
} from "../controllers/userController";
import { userAuth } from "../middleware/userAuth";
import { RequestHandler } from "express";

export const userRouter = Router();

userRouter.get(
  "/getUserData",
  userAuth,
  getUserData as unknown as RequestHandler
);

userRouter.get("/getProductData", getProductData);
userRouter.get("/getProduct/:id", getProduct);
