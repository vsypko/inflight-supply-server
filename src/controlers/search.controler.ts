import { Request, Response, NextFunction } from "express"
import { ISchedule } from "../types.js"

import db from "../db/db.js"
import {
  airportByCodeQuery,
  allCountriesQuery,
  allUsersQuery,
  scheduleFromQuery,
  scheduleToQuery,
  airportSearchQuery,
} from "../db/queries.js"

export async function getAirport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const airports = await db.query(airportSearchQuery(`${req.query.q}:*`))
    if (airports) res.send({ total_count: airports.rowCount, airports: airports.rows })
  } catch (e) {
    next(e)
  }
}

export async function getAirportbyCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const airports = await db.query(airportByCodeQuery(req.query.q as string))
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

export async function getSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const airport = req.query.airport?.toString()
    const date = req.query.date?.toString()
    if (!airport || !date) throw { status: 400, data: "Bad request. No params found." }
    const scheduleFrom = await db.query(scheduleFromQuery(airport, date))
    const scheduleTo = await db.query(scheduleToQuery(airport, date))
    const schedule = { scheduleFrom: [] as ISchedule[], scheduleTo: [] as ISchedule[] }
    if (scheduleFrom) schedule.scheduleFrom = scheduleFrom.rows
    if (scheduleTo) schedule.scheduleTo = scheduleTo.rows
    res.send(schedule)
  } catch (e) {
    next(e)
  }
}
