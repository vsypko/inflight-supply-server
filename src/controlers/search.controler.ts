import { Request, Response, NextFunction } from 'express'
import { ISchedule } from '../types.js'

import db from '../db/db.js'

export async function getAirport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const text =
      'SELECT id, type_ap, name, latitude, longitude, elevation_ft, continent, country, country_iso, iso_region, municipality, scheduled, icao, iata, home_link FROM airports WHERE ts_ap @@ to_tsquery($1) order by name'
    const values = [`${req.query.q}:*`]

    const airports = await db.query(text, values)
    if (airports)
      res.send({ total_count: airports.rowCount, airports: airports.rows })
  } catch (e) {
    next(e)
  }
}

export async function getAirportbyCode(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const text =
      'SELECT id, type_ap, name, latitude, longitude, elevation_ft, continent, country, country_iso, iso_region, municipality, scheduled, icao, iata, home_link FROM airports WHERE iata=$1'
    const values = [req.query.q]

    const airports = await db.query(text, values)
    if (airports)
      res.send({ total_count: airports.rowCount, airports: airports.rows })
  } catch (e) {
    next(e)
  }
}

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // const { column, value } = req.query
    const users = await db.query(
      'SELECT id, firstname, lastname, email, img_url, role_name as role, company_id, phone, country_iso FROM users INNER JOIN roles ON role=role_id'
    )
    if (users) res.send({ total_count: users.rowCount, users: users.rows })
  } catch (e) {
    next(e)
  }
}

export async function getAllCountries(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const text =
      'SELECT iso, title_case, phonecode, currency, flag FROM countries ORDER BY title_case'

    const countries = await db.query(text)
    if (countries) res.json(countries.rows)
  } catch (e) {
    next(e)
  }
}

export async function getSchedule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const airport = req.query.airport?.toString()
    const date = req.query.date?.toString()

    if (!airport || !date)
      throw { status: 400, data: 'Bad request. No params found.' }

    const textFrom = `SELECT TO_CHAR(std::time,'HH24:MI') AS departure, municipality || ' ['|| "to" ||']' AS destination, co_iata ||' '|| flight || ' [' || type || ']' AS flight FROM flights INNER JOIN airports ON "to"=iata WHERE date=$2::date AND "from"=$1 ORDER BY std`
    const valuesFrom = [airport, date]

    const scheduleFrom = await db.query(textFrom, valuesFrom)

    const textTo = `SELECT TO_CHAR(sta::time,'HH24:MI') AS arrival, municipality || ' ['|| "from" ||']' AS destination, co_iata ||' '|| flight || ' [' || type || ']' AS flight FROM flights INNER JOIN airports ON "from"=iata WHERE date=$2::date AND "to"=$1 ORDER BY sta`
    const valuesTo = [airport, date]
    const scheduleTo = await db.query(textTo, valuesTo)

    const schedule = {
      scheduleFrom: [] as ISchedule[],
      scheduleTo: [] as ISchedule[],
    }
    if (scheduleFrom) schedule.scheduleFrom = scheduleFrom.rows
    if (scheduleTo) schedule.scheduleTo = scheduleTo.rows
    res.send(schedule)
  } catch (e) {
    next(e)
  }
}
