import { Request, Response, NextFunction } from "express"
import db from "../db/db.js"
import { companyInsertScheduleQuery } from "../db/queries.js"

export async function scheduleUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = req.body.data
    if (!schedule) throw { status: 400, data: "Bad request. User data failure." }
    const result = await db.query(companyInsertScheduleQuery(schedule))
    if (!result) throw { status: 400, data: "Bad request: unique flight in schedule constraint violation" }
    res.json({ data: `Inserted ${result.rowCount} rows` })
  } catch (e) {
    next(e)
  }
}
