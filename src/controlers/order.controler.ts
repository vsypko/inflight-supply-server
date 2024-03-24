import { Request, Response, NextFunction } from 'express'
import db from '../db/db.js'
import { Item } from '../types.js'

export async function getFlights(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.query) throw { status: 400, data: 'Bad request' }
    const { ap, co, dtf, dtt } = req.query

    const flights = await db.query(
      `SELECT fl.id, TO_CHAR(fl.date,'YYYY-MM-DD') as date, fl.flight, fl.type, fl.reg, fl.from, fl.to, TO_CHAR(fl.std,'HH24:MI') as std, to_char(fl.sta,'HH24:MI') as sta, fl.seats, fl.co_id, fl.co_iata, ft.crew, ft.fc, ft.bc, ft.yc, fl.ordered FROM flights fl INNER JOIN fleet ft ON POSITION(fl.reg IN ft.reg)<>0 WHERE fl.date BETWEEN $3::date AND $4::date AND fl.from=$1 AND fl.co_id=$2 ORDER BY fl.date ASC, fl.std ASC`,
      [ap, co, dtf, dtt]
    )
    res.send(flights.rows)
  } catch (e) {
    next(e)
  }
}

export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.query) throw { status: 400, data: 'Bad request' }
    const { q: id } = req.query
    let result = await db.query(
      'SELECT i.id as order_id, i.item_price, i.item_qty, i.section, s.id, s.code, s.title, s.price, s.category, s.area, s.description, s.img_url, s.co_id FROM items i INNER JOIN supplies s ON i.item_id = s.id WHERE i.flight_id=$1',
      [id]
    )
    const orderItems = result.rows.map((i) => ({
      id: i.order_id,
      price: i.item_price,
      qty: i.item_qty,
      section: i.section,
      item: {
        id: i.id,
        code: i.code,
        title: i.title,
        price: i.price,
        category: i.category,
        area: i.area,
        description: i.description,
        img_url: i.img_url,
        co_id: i.co_id,
      },
    }))
    res.send({ data: orderItems })
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
    const { flights, items } = req.body

    await db.query('UPDATE flights SET ordered=true WHERE id=ANY($1)', [
      flights,
    ])

    await flights.forEach(async (flight: number) => {
      const values = items
        .map(
          (row: Item) =>
            `(${flight}, ${row.item_id}, ${row.item_price}, ${row.item_qty}, '${row.item_section}')`
        )
        .join(',')

      await db.query(
        `INSERT INTO items(flight_id, item_id, item_price, item_qty, section) VALUES ${values} ON CONFLICT (flight_id, item_id, section) DO UPDATE SET item_qty = EXCLUDED.item_qty, item_price=EXCLUDED.item_price`
      )
    })

    res.send({ data: 'Orders inserted' })
  } catch (e) {
    next(e)
  }
}

export async function deleteOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.body) throw { status: 400, data: 'Bad request' }
    const { ids } = req.body
    await db.query('UPDATE flights SET ordered=false WHERE id=ANY($1)', [ids])
    await ids.forEach(async (id: number) => {
      await db.query('DELETE FROM items WHERE flight_id=$1', [id])
    })
    res.send({ data: 'Orders deleted' })
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
