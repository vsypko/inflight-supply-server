import { Request, Response, NextFunction } from 'express'
import db from '../db/db.js'
import { IFlight } from '../types.js'

export async function getFlights(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.query) throw { status: 400, data: 'Bad request' }
    const { ap, co, dtf, dtt } = req.query
    let result: any

    result = await db.query(
      `SELECT fl.id, TO_CHAR(fl.date,'YYYY-MM-DD') as date, fl.flight, fl.type, fl.reg, fl.from, fl.to, TO_CHAR(fl.std,'HH24:MI') as std, to_char(fl.sta,'HH24:MI') as sta, fl.seats, fl.co_id, fl.co_iata, ft.crew, ft.fc, ft.bc, ft.yc, fl.order_id FROM flights fl INNER JOIN fleet ft ON POSITION(fl.reg IN ft.reg)<>0 WHERE fl.date BETWEEN $3::date AND $4::date AND fl.from=$1 AND fl.co_id=$2 ORDER BY fl.date ASC, fl.std ASC`,
      [ap, co, dtf, dtt]
    )

    res.send(result.rows)
  } catch (e) {
    next(e)
  }
}

export async function setOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.body) throw { status: 400, data: 'Bad request' }
    const { flights, orderId, contractId } = req.body
    const flightIds = await Promise.all(
      flights.map(async (flight: number) => {
        const updatedFlights = await db.query(
          `UPDATE flights SET order_id = $1::uuid WHERE id=$2 returning*`,
          [orderId, flight]
        )
        return updatedFlights.rows[0].id
      })
    )
    const order = await db.query(
      `INSERT INTO orders(id, contract_id, flights_qty) VALUES ($1, $2, $3) returning*`,
      [orderId, contractId, flights.length]
    )
    res.send({ flightIds, insertedOrder: order.rows[0] })
  } catch (e) {
    next(e)
  }
}
