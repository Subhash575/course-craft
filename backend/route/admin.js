import express from "express";
import bcrypt from "bcrypt";
import { AdminModel } from "../db.js";
import { signinSchema } from "../validation/user.validation.js";
import { signupSchema } from "../validation/user.validation.js";
import jwt from "jsonwebtoken";
const JWT_Secret = process.env.ADMIN_JWT_SECRET;
const router = express.Router();
// Here what we have done is all the endpoint restricted to admin. I put it here.

// admin signup
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
    const existingUser = await AdminModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await AdminModel.create({
      email,
      password: hashPassword,
      firstName,
      lastName,
    });

    res.status(200).json({ message: "Admin signup successful", user: user });
  } catch (err) {
    res.status(500).json({ message: "signup failed", error: err.message });
  }
});

// admin login
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

    const user = await AdminModel.findOne({ email });
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

    res.status(200).json({ message: "Admin signin", token: token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// After signup, login I can use the `middleware` so that all admin-related endpoint is
// only access by admin.

// create course
router.post("/course", (req, res) => {});

// delete course
router.delete("/course/:id", (req, res) => {});

// add course content
router.put("/course", (req, res) => {});

// admin get all of their courses in bulk
router.get("/course/bulk", (req, res) => {});

export const adminRoute = router;
