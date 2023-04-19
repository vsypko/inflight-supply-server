import { Request, Response, NextFunction } from "express"
import db from "../db/db.js"
import {
  getFlightsTableNameQuery,
  getFlightsQuery,
  companyInsertFlightsQuery,
  companyDeleteFlightQuery,
  companyUpdateFlightQuery,
} from "../db/queries.js"

async function getTableFlights(id: number) {
  const flightsTableName = await db.query(getFlightsTableNameQuery(id))
  if (!flightsTableName) throw { status: 400, data: "No created flights" }
  return flightsTableName.rows[0].co_tb
}

export async function getFlights(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.query) throw { status: 400, data: "Bad request" }
    const table = await getTableFlights(Number(req.query.id))
    const date = req.query.date!.toString()
    const result = await db.query(getFlightsQuery(table, date))
    res.json(result.rows)
  } catch (e) {
    next(e)
  }
}

export async function updateFlights(req: Request, res: Response, next: NextFunction) {
  try {
    const flights = req.body.values
    if (!flights) throw { status: 400, data: "Bad request. File data failure." }
    const table = await getTableFlights(Number(req.body.id))
    const result = await db.query(companyInsertFlightsQuery(table, flights))
    res.json({ data: `Inserted ${result.rowCount} rows` })
  } catch (e) {
    next(e)
  }
}

export async function addFlight(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.query) throw { status: 400, data: "Bad request" }
    const table = await getTableFlights(Number(req.query.co))
    const flight = Number(req.query.fl)
    await db.query(companyDeleteFlightQuery(table, flight))
    res.json({ data: "Flight has been added" })
  } catch (e) {
    next(e)
  }
}

export async function updateFlight(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.query) throw { status: 400, data: "Bad request" }
    const table = await getTableFlights(Number(req.body.co))
    const flight = req.body.flight
    await db.query(companyUpdateFlightQuery(table, flight))
    res.json({ data: "Flight has been updated" })
  } catch (e) {
    next(e)
  }
}

export async function deleteFlight(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.query) throw { status: 400, data: "Bad request" }
    const table = await getTableFlights(Number(req.query.co))
    const flight = Number(req.query.fl)
    await db.query(companyDeleteFlightQuery(table, flight))
    res.json({ data: "Flight has been deleted" })
  } catch (e) {
    next(e)
  }
}
