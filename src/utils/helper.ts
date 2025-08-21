import { NextFunction, Request, Response } from "express";

export const validateIdParam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // check if id exists and is a number
    if (!id || typeof id !== 'number' || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid or missing ID parameter" });
    }

    next();
  } catch (error) {
    return res.status(422).json({ message: "Invalid ID parameter" });
  }
}