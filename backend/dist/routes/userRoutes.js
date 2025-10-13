"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const userAuth_1 = require("../middleware/userAuth");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get("/getUserData", userAuth_1.userAuth, userController_1.getUserData);
