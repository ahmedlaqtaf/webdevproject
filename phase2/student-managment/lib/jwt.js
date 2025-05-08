import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET;

export function signJwt(payload, expiresIn = "7d") {
  return jwt.sign(payload, secretKey, { expiresIn });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}