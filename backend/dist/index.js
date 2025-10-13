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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const authRoutes_1 = require("./routes/authRoutes");
// import { userRouter } from "./routes/userRoutes";
const app = (0, express_1.default)();
const port = process.env.PORT || 50000;
const allowedOrigins = ["http://localhost:5173"];
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: allowedOrigins, credentials: true }));
app.use("/auth", authRoutes_1.authRouter);
// app.use("/user", userRouter);
const runServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.connectDB)();
    app.listen(port, () => {
        console.log("Server is running on port: ", port);
    });
});
runServer();
