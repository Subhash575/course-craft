import express from "express";
const router = express.Router();

// Here what we have done is all the endpoint restricted to admin. I put it here.

// admin signup
router.post("/signup", (req, res) => {});

// admin login
router.post("/login", (req, res) => {});

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
