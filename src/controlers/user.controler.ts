import { Request, Response, NextFunction } from "express"

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file
    res.send("OK")
  } catch (e) {
    next(e)
  }
}
