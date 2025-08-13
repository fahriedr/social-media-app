import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorLogger = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error processing ${req.method} ${req.url}`, err);
  next(err); // Pass to next error handler
};
