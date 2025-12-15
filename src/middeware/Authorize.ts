import { NextFunction, Request, Response } from "express";
import { customRequestType } from "../types/http";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export const authorize = (req: Request, res: Response, next: NextFunction) => {
  try {
    const customReq = req as customRequestType;
    const header = req.get("Authorization");

    if (!header) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const [schema, token] = header.split(" ");

    if (schema !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid authorization format. Use 'Bearer <token>'" });
    }

    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role?: string;
    };

    customReq.user = {
      id: payload.id,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    next(error);
  }
};
