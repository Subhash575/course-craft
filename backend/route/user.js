import express from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../db.js";
import { signupSchema } from "../validation/user.validation.js";
import { signinSchema } from "../validation/user.validation.js";
import jwt from "jsonwebtoken";
const router = express.Router();

const JWT_Secret = process.env.USER_JWT_SECRET;
if (!JWT_Secret) {
  throw new Error("USER_JWT_SECRET is missing in environment variables.");
}

// signup endpoint:-
router.post("/signup", async (req, res) => {
  try {
    // First Input validation
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Incorrect Format",
        error: result.error,
      });
      return;
    }

    const { email, password, firstName, lastName } = result.data;

    // Hashing password.
    const hashPassword = await bcrypt.hash(password, 5);

    // Checking existing User
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await UserModel.create({
      email,
      password: hashPassword,
      firstName,
      lastName,
    });

    res.status(200).json({ message: "user signup successful", user: user });
  } catch (err) {
    res.status(500).json({ message: "signup failed", error: err.message });
  }
});

// login endpoint:-
router.post("/signin", async (req, res) => {
  try {
    // input validation:-
    const result = signinSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Incorrect format", error: result.error });
    }

    // dereferencing the content
    const { email, password } = result.data;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If password is correct than JWT_token is generated
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_Secret,
    );

    res.status(200).json({ message: "user signin", token: token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// view purchase course:-
router.get("/purchases", (req, res) => {});

export const userRoute = router;
