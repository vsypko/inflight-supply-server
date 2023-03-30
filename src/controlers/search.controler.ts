import { Request, Response, NextFunction } from "express"

import db from "../db/db.js"
import { airportQuery, allCountriesQuery, allUsersQuery } from "../db/queries.js"

export async function getAirport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const airports = await db.query(airportQuery(`${req.query.q}:*`))
    if (airports) res.send({ total_count: airports.rowCount, airports: airports.rows })
  } catch (e) {
    next(e)
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await db.query(allUsersQuery())
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
