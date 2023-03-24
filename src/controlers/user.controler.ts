import { Request, Response, NextFunction } from "express"

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file
    if (!file) throw { status: 400, data: "Bad request. File upload failure." }
    const id = req.body.id
    if (!id) throw { status: 400, data: "Bad request. User data failure." }
    res.json({ data: "Image uploaded" })
    next()
  } catch (e) {
    next(e)
  }
}
