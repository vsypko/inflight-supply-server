import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) throw { status: 401, data: "Unauthorized request" }
    const token = authHeader.split(" ")[1]
    if (!token) throw { status: 401, data: "Unauthorized request" }

    const tokenData = jwt.verify(token, process.env.JWT_ACCESS_SECRET as jwt.Secret) as { id: number; role: number }
    if (!tokenData) throw { status: 401, data: "Unauthorized request" }

    if (tokenData.role > 2) throw { status: 401, data: "Unauthorized request" }

    next()
  } catch (e) {
    throw { status: 401, data: "Unauthorized request" }
  }
}

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  res.status(err.status).json(err.data)
}
