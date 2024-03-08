import { Request, Response, NextFunction } from 'express'
import db from '../db/db.js'
import { IFlight, IOrderedSupply } from '../types.js'

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
    const { flights, orderId, contractId, items } = req.body

    const flightIds = await Promise.all(
      flights.map(async (flight: number) => {
        const updatedFlights = await db.query(
          'UPDATE flights SET order_id = $1::uuid WHERE id=$2 RETURNING*',
          [orderId, flight]
        )
        return updatedFlights.rows[0].id
      })
    )
    const order = await db.query(
      'INSERT INTO orders(id, contract_id, flights_qty) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET id=$1, contract_id=$2, flights_qty=$3 RETURNING*',
      [orderId, contractId, flights.length]
    )

    const values = items
      .map(
        (row: IOrderedSupply) =>
          `('${orderId}', ${row.item_id}, ${row.item_price}, ${row.item_qty}, '${row.item_section}')`
      )
      .join(',')
    const result = await db.query(
      `INSERT INTO ordered_supplies(order_id, item_id, item_price, item_qty, section) VALUES ${values}`
    )

    res.send({
      flightIds,
      insertedOrder: order.rows[0],
      items: result.rowCount,
    })
  } catch (e) {
    next(e)
  }
}

// async function removeOldOrder(flights: number[]) {
//   const flightsId = await db.query('SELECT id FROM flights WHERE id IN $1', [])
//   console.log(orderId)

//   const flightsIdOrdered = flightsId.rows.filter((id) =>
//     flights.some((el) => el === id)
//   )
//   console.log(flights.length, flightsIdOrdered.length)

//   if (flights.length === flightsIdOrdered.length) {
//     await db.query('DELETE FROM orders WHERE id = $1', [orderId])
//   }
// }
