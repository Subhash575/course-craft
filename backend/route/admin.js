import express from "express";
import bcrypt from "bcrypt";
import { AdminModel } from "../db.js";
import { signinSchema } from "../validation/user.validation.js";
import { signupSchema } from "../validation/user.validation.js";
import { CourseModel } from "../db.js";
import { adminMiddleware } from "../middleware/admin.js";
import { r2 } from "../config/r2.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import jwt from "jsonwebtoken";
const JWT_Secret = process.env.ADMIN_JWT_SECRET;
// We always set-different secret for amdin, user so that bydefault user with same userId,payload
// not able to hit the admin endpoint. (imp pt to know)-->
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

router.post("/course/upload-url", adminMiddleware, async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        message: "fileName and fileType are required",
      });
    }

    // Only allow images for now
    if (!fileType.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image files are allowed",
      });
    }

    // Create unique file name
    const uniqueFileName = `${crypto.randomUUID()}-${fileName}`;

    // Path inside R2 bucket
    const key = `courses/thumbnails/${uniqueFileName}`;

    // Tell R2 what object we want to upload
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Generate temporary upload URL
    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 300,
    });

    return res.status(200).json({
      uploadUrl,
      key,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to generate upload URL",
    });
  }
});
/*
Cloudflare documents this same general pattern: create a PutObjectCommand, then generate a presigned URL with getSignedUrl.
*/

// create course
router.post("/course", adminMiddleware, async (req, res) => {
  try {
    const { title, description, price, imageKey } = req.body;

    if (!title || !description || price === undefined || !imageKey) {
      return res.status(400).json({
        message: "All course fields are required",
      });
    }

    const course = await CourseModel.create({
      title,
      description,
      price,
      imageKey,
      creatorId: req.userId,
    });

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to create course",
    });
  }

  // ----- testing endpoint -----------
  // return res.status(200).json({
  //   message: "Admin middleware is working",
  //   adminId: req.userId,
  // });
});

// update course content
router.put("/course", adminMiddleware, async (req, res) => {
  try {
    // We need to know which course, We need to update that why "courseId" is needed.
    const { title, description, price, imageKey, courseId } = req.body;

    // (v.imp):- We need to check this course_Id belong to it creator or not.
    // otherwise it create the problem bcs. Any creator with this courseId able to edit.
    // this course.

    // 1. Check courseId
    if (!courseId) {
      return res.status(400).json({
        message: "courseId is required",
      });
    }

    // 2. Find the course
    const course = await CourseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // req.userId is adminId, course.creatorId is the person who own the course.
    // 3. Check course ownership
    // They both are "Object" type that why we first convert it into string then compare.
    if (course.creatorId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    // 4. Update course
    course.title = title;
    course.description = description;
    course.price = price;
    course.imageKey = imageKey;

    // We already fetched the course document using findById().
    // After modifying its fields, save() writes those changes back to MongoDB.
    // Use updateOne()/findByIdAndUpdate() when you want to update directly without modifying a fetched document.
    await course.save();

    res
      .status(200)
      .json({ message: "course update successfully", courseId: course._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete course
router.delete("/course/:id", adminMiddleware, async (req, res) => {
  try {
    const adminId = req.userId;
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);

    // checking "course existed or not".
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // checking the owner of the course
    if (adminId.toString() !== course.creatorId.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Important point is "filter parameter" name need to match with. Model schema name for
    // filtering.
    const delCourse = await CourseModel.deleteOne({ _id: courseId });
    res.status(200).json({ message: delCourse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// admin get all of their courses in bulk
router.get("/course/bulk", (req, res) => {});

export const adminRoute = router;
