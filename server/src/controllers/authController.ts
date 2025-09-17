import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import db from "../db/connection";

export const signup = async (req: Request, res: Response) => {
  const { name, email, dob, gender, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (name, email, dob, gender, password) VALUES (?, ?, ?, ?, ?)",
      [name, email, dob, gender, hashedPassword]
    );
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Signup failed");
  }
};
