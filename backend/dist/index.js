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
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = __importDefault(require("zod"));
const users_1 = require("./models/users");
const middleware_1 = require("./middleware");
const bcrypt = require("bcrypt");
dotenv_1.default.config();
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
mongoose_1.default.connect(MONGO_URL);
const app = (0, express_1.default)();
app.use(express_1.default.json());
const UserValidationSchema = zod_1.default.object({
    username: zod_1.default.string().min(2),
    password: zod_1.default.string().min(8)
});
app.listen(3000, () => {
    console.log("Listening to the port");
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const result = UserValidationSchema.safeParse({ username, password });
    if (!result.success) {
        res.status(411).json("Error in Inputs !");
        return;
    }
    try {
        const existingUser = yield users_1.UserModel.findOne({ username });
        if (existingUser) {
            res.status(403).json("User Already Exists !");
            return;
        }
        const hashedPassword = yield bcrypt.hash(password, 10);
        yield users_1.UserModel.create({ username, password: hashedPassword });
        res.json("User Created Successfully!!");
        console.log("User Created!!");
    }
    catch (error) {
        res.status(500).json("Error in Database !");
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield users_1.UserModel.findOne({ username });
    if (!user) {
        res.json("User doesn't exist");
        return;
    }
    ;
    const isValid = yield bcrypt.compare(password, user.password);
    if (!isValid) {
        res.status(403).send("Wrong email password!!!!");
        return;
    }
    ;
    const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET);
    res.json({ token: token });
    console.log(token);
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, link } = req.body;
    //@ts-ignore
    yield users_1.ContentModel.create({ title, link, userId: req.userId, tags: [] });
    res.json("Content Added!!");
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = yield users_1.ContentModel.findOne({
        userId: userId
    }).populate("userId", "username");
    res.json({ content });
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    try {
        yield users_1.ContentModel.deleteMany({
            _id: contentId
        });
        res.json("Deleted Content");
    }
    catch (error) {
        res.json(error);
    }
}));
app.post("/api/v1/brain/share", (req, res) => {
});
app.get("/api/v1/brain/:shareLink", (req, res) => {
});
