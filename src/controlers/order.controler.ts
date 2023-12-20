import { Request, Response, NextFunction } from "express"
import db from "../db/db.js"
import { IFlight } from "../types.js"

export async function getFlights(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.query) throw { status: 400, data: "Bad request" }
    const { ap: airport, co: company, dtf: datefrom, dtt: dateto } = req.query
    let result: any

    result = await db.query(
      `SELECT id, TO_CHAR(date,'YYYY-MM-DD') as date, flight, type, reg, "from", "to", TO_CHAR(std,'HH24:MI') as std, to_char(sta,'HH24:MI') as sta, seats, co_id, co_iata FROM flights WHERE date BETWEEN $3::date AND $4::date AND "from"=$1 AND co_id=$2 ORDER BY date ASC, std ASC`,
      [airport, company, datefrom, dateto],
    )

    res.send(result.rows)
  } catch (e) {
    next(e)
  }
}
