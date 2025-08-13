// middlewares/validate.ts
import { ZodError, ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { HttpException } from "../models/http-exception";

export const validate =
    (schema: ZodObject) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {

                console.log(req.body)

                schema.parse(req.body);
                next();
            } catch (err) {
                if (err instanceof ZodError) {
                    const errorMap: Record<string, string> = {};
                    err.issues.forEach((issue) => {
                        const fieldPath = issue.path.join(".");
                        errorMap[fieldPath] = issue.message;
                    });

                    return next(new HttpException(422, "Validation error", { errors: errorMap }));
                }
                next(err);
            }
        };
