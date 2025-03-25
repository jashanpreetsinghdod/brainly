"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
function userMiddleware(req, res, next) {
    const header = req.headers["authorization"];
    const decoded = jsonwebtoken_1.default.verify(header, JWT_SECRET);
    if (decoded) {
        req.userId = decoded.id;
        next();
    }
    else {
        res.status(403).json({ message: "Unauthorized" });
    }
}
