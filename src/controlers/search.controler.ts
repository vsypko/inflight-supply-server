import { Request, Response, NextFunction } from "express"

import db from "../db/db.js"
import { airportQuery, airportbycodeQuery, allCountriesQuery, allUsersQuery } from "../db/queries.js"
import cookieParser from "cookie-parser"

export async function getAirport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const airports = await db.query(airportQuery(`${req.query.q}:*`))
    if (airports) res.send({ total_count: airports.rowCount, airports: airports.rows })
  } catch (e) {
    next(e)
  }
}

export async function getAirportbyCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const airports = await db.query(airportbycodeQuery(req.query.q as string))
    if (airports) res.send({ total_count: airports.rowCount, airports: airports.rows })
  } catch (e) {
    next(e)
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { column, value } = req.query
    const users = await db.query(allUsersQuery(column as string, Number(value)))
    if (users) res.send({ total_count: users.rowCount, users: users.rows })
  } catch (e) {
    next(e)
  }
}

export async function getAllCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const countries = await db.query(allCountriesQuery())
    if (countries) res.json(countries.rows)
  } catch (e) {
    next(e)
  }
}
