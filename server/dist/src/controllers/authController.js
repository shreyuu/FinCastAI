"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connection_1 = __importDefault(require("../db/connection"));
const signup = async (req, res) => {
    const { name, email, dob, gender, password } = req.body;
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await connection_1.default.execute("INSERT INTO users (name, email, dob, gender, password) VALUES (?, ?, ?, ?, ?)", [name, email, dob, gender, hashedPassword]);
        res.status(201).send("User registered successfully");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Signup failed");
    }
};
exports.signup = signup;
