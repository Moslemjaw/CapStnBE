import { NextFunction, Request, Response } from "express";

const errorHandling = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    error: err,
  });
};

export default errorHandling;
