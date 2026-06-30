import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({ status: "not ok", msg: "No token provided" });
    }

    const parts = authHeader.split(" ");
    let token = authHeader;
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      token = parts[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: "not ok", msg: "Invalid token", error: err.message });
  }
};
