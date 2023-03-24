import { Request, Response, NextFunction } from "express"
import db from "../db/db.js"
import { userDeleteUrlQuery, userInsertUrlQuery } from "../db/queries.js"
import * as fs from "fs"

export async function savePhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file
    if (!file) throw { status: 400, data: "Bad request. File upload failure." }
    const id = req.body.id
    const newUrl = req.body.newUrl
    if (!id || !newUrl) throw { status: 400, data: "Bad request. User data failure." }
    if (newUrl) await db.query(userInsertUrlQuery(id, file.originalname))
    res.json({ data: "Image uploaded" })
    next()
  } catch (e) {
    next(e)
  }
}

export async function deleteUserUrl(req: Request, res: Response, next: NextFunction) {
  try {
    fs.unlinkSync(`uploads/uph/${req.params.url}`)
    await db.query(userDeleteUrlQuery(req.params.url))
    res.json({ data: "Photo deleted successfully" })
  } catch (e) {
    next(e)
  }
}
