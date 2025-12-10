import { NextFunction, Request, Response } from "express";
import { customRequestType } from "../types/http";
import jwt from "jsonwebtoken";

export const authorize = (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = req as customRequestType;
    const header = req.get("Authorization");
    const [Schema, token] = header?.split(" ") ?? [];
    if (Schema !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role?: string;
    };
    r.user = {
      id: payload.id,
      role: payload.role || "user",
    };
    next();
  } catch (error) {
    next(error);
  }
};
