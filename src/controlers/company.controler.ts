import { Request, Response, NextFunction } from "express"
import db from "../db/db.js"
import { getFlightsTableNameQuery, getFlightsQuery, companyInsertFlightsQuery } from "../db/queries.js"

export async function getFlights(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.query) throw { status: 400, data: "Bad request" }
    const flightsTableName = await db.query(getFlightsTableNameQuery(Number(req.query.id)))
    if (!flightsTableName) throw { status: 400, data: "No created flights" }
    const table = flightsTableName.rows[0].co_tb
    const date = req.query.date!.toString()
    const result = await db.query(getFlightsQuery(table, date))
    res.send(result.rows)
  } catch (e) {
    next(e)
  }
}

export async function flightsUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const flights = req.body.data.values
    if (!flights) throw { status: 400, data: "Bad request. File data failure." }
    const flightsTableName = await db.query(getFlightsTableNameQuery(Number(req.body.data.id)))
    if (!flightsTableName) throw { status: 400, data: "No created flights" }
    const table = flightsTableName.rows[0].co_tb
    const result = await db.query(companyInsertFlightsQuery(table, flights))
    res.json({ data: `Inserted ${result.rowCount} rows` })
  } catch (e) {
    next(e)
  }
}
