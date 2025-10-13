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
exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken } = req.cookies;
    console.log(accessToken);
    if (!accessToken) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorised, Token expired" });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
        if (decodedToken.id) {
            req.userId = decodedToken.id;
            return next();
        }
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            res
                .status(401)
                .json({ success: false, message: "Unauthorised, Invalid Token" });
        }
        else {
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    }
});
exports.userAuth = userAuth;
