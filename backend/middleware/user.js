import jwt from "jsonwebtoken";

const JWT_Secret = process.env.USER_JWT_SECRET;
// user middleware:-

export function userMiddleware(req, res, next) {
  // First token get then verify it.
  try {
    // 1. Get token
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ message: "User not signin" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_Secret);

    // 3. Get userId from token
    req.userId = decoded.userId;

    // 4. Continue to the next middleware/route
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
