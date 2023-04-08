import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export function authMiddleware(role: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) throw { status: 401, data: "Unauthorized request" }
      const token = authHeader.split(" ")[1]
      if (!token) throw { status: 401, data: "Unauthorized request" }

      const tokenData = jwt.verify(token, process.env.JWT_ACCESS_SECRET as jwt.Secret) as { id: number; role: number }
      if (!tokenData) throw { status: 401, data: "Unauthorized request" }

      if (tokenData.role > role) throw { status: 401, data: "Unauthorized request" }

      next()
    } catch (e) {
      throw { status: 401, data: "Unauthorized request" }
    }
  }
}

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  if (typeof err === "object" && err != null && "status" in err && "data" in err) {
    res.status(err.status).json(err.data)
    return
  }
  if (typeof err === "object" && err != null && "code" in err) {
    res.status(400).json(`Bad request.\n Code: ${err.code}, ${err.toString()}`)
    return
  }
  res.status(400).json(err)
}
