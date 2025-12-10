import { NextFunction, Request, Response } from "express";

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(404).json("Route not found");
  } catch (error) {
    next(error);
  }
};
export default notFoundHandler;
