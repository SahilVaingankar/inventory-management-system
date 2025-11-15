import { Router } from "express";
import { RequestHandler } from "express";
import {
  refresh,
  login,
  logout,
  register,
  getOrders,
  postorders,
  updateOrderStatus,
  getUsers,
  deleteUser,
  addProduct,
  updateProduct,
  deleteProduct,
  addUser,
} from "../controllers/authController";
import { userAuth } from "../middleware/userAuth";
import {
  LoginValidation,
  RegistrationValidation,
} from "../middleware/FormValidation";
// import { getProduct } from "../controllers/userController";

export const authRouter = Router();

authRouter.post("/register", RegistrationValidation, register);
authRouter.post("/login", LoginValidation, login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refresh);
authRouter.get("/orders", userAuth, getOrders);
authRouter.post("/placeorder", userAuth, postorders);
authRouter.patch("/processorder/:id", userAuth, updateOrderStatus);

//admin routes
authRouter.get("/users", userAuth, getUsers);
authRouter.delete("/users/:id", userAuth, deleteUser);
authRouter.post("/products", userAuth, addProduct);
authRouter.patch("/products/:id", userAuth, updateProduct);
authRouter.delete("/products/:id", userAuth, deleteProduct);
// authRouter.get("/products", userAuth, getProduct);
authRouter.post("/users", userAuth, addUser);
