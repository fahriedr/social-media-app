import { Request, Response, NextFunction } from "express";
import { HttpException } from "../models/http-exception";

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof HttpException) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(typeof err.details === "object" && err.details !== null ? { details: err.details } : {}),
        });
    }

    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
};