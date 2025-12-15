import { NextFunction, Request, Response } from "express";

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

const errorHandling = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
};

export default errorHandling;
