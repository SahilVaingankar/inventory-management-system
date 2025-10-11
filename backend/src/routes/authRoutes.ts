import Router from "express";
import { RequestHandler } from "express";
import {
  refresh,
  login,
  logout,
  register,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from "../controllers/authController";
import { userAuth } from "../middleware/userAuth";
import {
  LoginValidation,
  RegistrationValidation,
} from "../middleware/FormValidation";

export const authRouter = Router();

authRouter.post("/register", RegistrationValidation, register);
authRouter.post("/login", LoginValidation, login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refresh);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);
