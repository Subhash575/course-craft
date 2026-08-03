import express from "express";

const router = express.Router();

// purchase a course
router.post("/purchase", (req, res) => {});

// preview a course
router.get("/preview", (req, res) => {});

export const courseRoute = router;
