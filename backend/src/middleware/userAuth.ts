import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  id: string;
}

export const userAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorised, Token expired" });
  }

  try {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET!
    );
    if ((decodedToken as JwtPayload).id) {
      req.userId = (decodedToken as JwtPayload).id;
      return next();
    }
  } catch (error) {
    if ((error as jwt.JsonWebTokenError).name === "JsonWebTokenError") {
      res
        .status(401)
        .json({ success: false, message: "Unauthorised, Invalid Token" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};
