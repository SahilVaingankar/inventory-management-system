import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { authRouter } from "./routes/authRoutes";
import { userRouter } from "./routes/userRoutes";

const app = express();
const port = process.env.PORT || 50000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://e-commerce-website-steel-eight.vercel.app",
];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use("/auth", authRouter);
app.use("/user", userRouter);

const runServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server is running on port: http://localhost/${port}`);
  });
};

runServer();
