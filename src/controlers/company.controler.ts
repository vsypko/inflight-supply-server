import { Request, Response, NextFunction } from 'express'
import db from '../db/db.js'
import { QueryResult } from 'pg'
import { readFile, rm, access } from 'node:fs/promises'
import { IFleet, IFlight, ISupply } from '../types.js'

export async function createCompany(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.body) throw { staus: 400, data: 'Bad request' }
    const user_id = req.body.id
    const user_role = req.body.role
    let company_id = req.body.company_id

    if ('newCompany' in req.body) {
      const { category, name, reg_number, country_iso, icao, iata } =
        req.body.newCompany
      const result = await db.query(
        'INSERT INTO companies (category, name, reg_number, country_iso, icao, iata ) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
        [category, name, reg_number, country_iso, icao, iata]
      )
      company_id = result.rows[0].id
    }
    const result = await db.query(
      'UPDATE users u SET role=r.role_id, company_id=$1 FROM roles r WHERE r.role_name=$2 AND u.id=$3 RETURNING *',
      [company_id, user_role, user_id]
    )

    res.send({ data: 'Company updated', company_id })
  } catch (e) {
    next(e)
  }
}

export async function getCompanies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.query) throw { status: 400, data: 'Bad request' }
    const companies = await db.query(
      `SELECT co.id, co.category, co.name, co.reg_number, co.icao, co.iata, co.country_iso, cn.title_case country, co.city, co.address, co.link, cn.currency, cn.flag FROM companies co INNER JOIN countries cn ON country_iso=iso WHERE co.name ILIKE '%${req.query.q}%' ORDER BY co.name`
    )
    if (companies)
      res.send({ total_count: companies.rowCount, companies: companies.rows })
  } catch (e) {
    next(e)
  }
}

export async function getCompaniesForAirport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.query) throw { status: 400, data: 'Bad request' }
    const { type, airport } = req.query
    const result = await db.query(
      'SELECT c.id, c.name, c.reg_number, c.iata, c.icao, c.country_iso FROM companies c INNER JOIN places p ON c.category=$1 AND c.id=p.company_id AND p.airport_id=$2',
      [type, airport]
    )
    res.send(result.rows)
  } catch (e) {
    next(e)
  }
}

export async function getCompanyCountry(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.query || typeof req.query.q != 'string')
      throw { status: 400, data: 'Bad request' }
    const country = await db.query('SELECT * FROM countries WHERE iso=$1', [
      req.query.q,
    ])
    if (country) res.send(country.rows[0])
  } catch (e) {
    next(e)
  }
}

export async function getCompanyItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.params || !req.query) throw { status: 400, data: 'Bad request' }
    if (req.params.type === 'flights') {
      let date: string = new Date(
        new Date().toISOString().slice(0, 10)
      ).toString()
      if (req.query.date) date = req.query.date.toString()
      const result = await db.query(
        `SELECT id, TO_CHAR(date,'YYYY-MM-DD') as date, flight, type, reg, "from", "to", TO_CHAR(std,'HH24:MI') as std, to_char(sta,'HH24:MI') as sta, seats, co_id, co_iata FROM flights WHERE co_id=$1 AND date=$2::date ORDER BY "from" ASC, std ASC`,
        [req.query.id, date]
      )
      res.json(result.rows)
      return
    }
    if (req.params.type === 'fleet') {
      const result = await db.query(
        `SELECT * FROM fleet WHERE co_id=$1 ORDER BY reg`,
        [req.query.id]
      )
      res.json(result.rows)
      return
    }
    if (req.params.type === 'supplies') {
      const result = await db.query(
        `SELECT * FROM supplies WHERE co_id=$1 ORDER BY code ASC, category ASC`,
        [req.query.id]
      )
      res.json(result.rows)
      return
    }

    if (req.params.type === 'places') {
      const result = await db.query(
        'SELECT p.id, ap.name, ap.iata, ap.municipality, ap.country, ap.country_iso, p.airport_id, p.company_id FROM places p INNER JOIN airports ap ON p.airport_id=ap.id WHERE company_id=$1',
        [req.query.id]
      )
      res.json(result.rows)
      return
    }
    res.json({ data: 'No data found' })
  } catch (e) {
    next(e)
  }
}

export async function insertCompanyItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let result: QueryResult<any>
  try {
    if (!req.params)
      throw { status: 400, data: 'Bad request. No params found.' }
    const data = req.body.values
    if (!data) throw { status: 400, data: 'Bad request. File data failure.' }

    if (req.params.type === 'flights') {
      const values = data
        .map(
          (row: IFlight) =>
            `('${row.date}'::date, ${row.flight}, '${row.type}', '${row.reg}', '${row.from}', '${row.to}', '${row.std}'::time, '${row.sta}'::time, ${row.seats}, ${row.co_id}, '${row.co_iata}')`
        )
        .join(',')
      result = await db.query(
        `INSERT INTO flights (date, flight, type, reg, "from", "to", std, sta, seats, co_id, co_iata) VALUES ${values}`
      )
      res.json({ data: `Inserted ${result.rowCount} rows` })
      return
    }

    if (req.params.type === 'fleet') {
      const values = data
        .map(
          (row: IFleet) =>
            `('${row.name}', '${row.type}', '${row.reg}', ${row.seats}, ${row.crew}, ${row.fc}, ${row.bc}, ${row.yc}, ${row.co_id})`
        )
        .join(',')
      result = await db.query(
        `INSERT INTO fleet (name, type, reg, seats, crew, fc, bc, yc, co_id) VALUES ${values}`
      )
      res.json({ data: `Inserted ${result.rowCount} rows` })
      return
    }

    if (req.params.type === 'supplies') {
      const values = data
        .map(
          (row: ISupply) =>
            `(${row.code},'${row.title}', '${row.category}', '${row.area}', '${row.description}', ${row.price}, '${row.co_id}')`
        )
        .join(',')

      result = await db.query(
        `INSERT INTO supplies (code, title, category, area, description, price, co_id) VALUES ${values} RETURNING*`
      )
      res.json({
        data: `Inserted ${result.rowCount} rows`,
        id: result.rows[0].id,
      })
      return
    }

    if (req.params.type === 'places') {
      const values = data[0]
      result = await db.query(
        'INSERT INTO places (airport_id, company_id) VALUES ($1, $2) RETURNING*',
        [values.airport_id, values.company_id]
      )
      res.json({ data: 'Inserted place of supply' })
      return
    }

    res.json({ data: 'No data found' })
  } catch (e) {
    console.log(e)
    next(e)
  }
}

export async function updateCompanyItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.params) throw { status: 400, data: 'Bad request. No params found.' }
  try {
    const data = req.body.value
    if (req.params.type === 'flights') {
      await db.query(
        `UPDATE flights SET date=$2::date, flight=$3, type=$4, reg=$5, "from"=$6, "to"=$7, std=$8, sta=$9, seats=$10 WHERE id=$1`,
        [
          data.id,
          data.date,
          data.flight,
          data.type,
          data.reg,
          data.from,
          data.to,
          data.std,
          data.sta,
          data.seats,
        ]
      )
      res.json({ data: 'Flight has been updated' })
      return
    }
    if (req.params.type === 'fleet') {
      await db.query(
        `UPDATE fleet SET name=$2, type=$3, reg=$4, seats=$5, crew=$6, fc=$7, bc=$8, yc=$9 WHERE id=$1`,
        [
          data.id,
          data.name,
          data.type,
          data.reg,
          data.seats,
          data.crew,
          data.fc,
          data.bc,
          data.yc,
        ]
      )
      res.json({ data: 'Aircraft has been updated' })
      return
    }
    if (req.params.type === 'supplies') {
      //get old image file url if exists and delete it ----------------------------------------------------------
      if (data.id) {
        const url = await db.query(`SELECT img_url FROM supplies WHERE id=$1`, [
          data.id,
        ])
        const oldUrl = url.rows[0].img_url
        if (oldUrl && oldUrl !== undefined) await rm(`uploads/itm/${oldUrl}`)
      }
      await db.query(
        `UPDATE supplies SET code=$2, title=$3, price=$4, category=$5, area=$6, description=$7, img_url=$8 WHERE id=$1`,
        [
          data.id,
          data.code,
          data.title,
          data.price,
          data.category,
          data.area,
          data.description,
          data.img_url,
        ]
      )
      res.json({ data: 'Item has been updated' })
      return
    }
    res.json({ data: 'No data found' })
  } catch (e) {
    next(e)
  }
}

export async function deleteCompanyItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.query && !req.params)
    throw { status: 400, data: 'Bad request. No query found.' }
  try {
    const type = req.params.type.toString()
    const id = Number(req.query.id)
    if (!id || !type)
      throw { status: 400, data: 'Bad request. Item data failure.' }

    if (type === 'supplies') {
      const data = await db.query(`SELECT img_url FROM supplies WHERE id=$1`, [
        id,
      ])
      const url = data.rows[0].img_url
      if (url && url !== undefined) await rm(`uploads/itm/${url}`)
    }
    await db.query(`DELETE FROM ${type} WHERE id=$1`, [id])
    res.json({ data: 'Data row has been deleted' })
  } catch (e) {
    next(e)
  }
}

export async function getItemImgUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!access(`uploads/itm/${req.params.url}`))
      throw { status: 400, data: 'Bad request. File load failure.' }
    const image = await readFile(`uploads/itm/${req.params.url}`)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Encoding', 'binary')
    res.send(image)
  } catch (e) {
    next(e)
  }
}

export async function updateItemImg(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.body.id
    const type = req.body.type

    if (!type) throw { status: 400, data: 'Bad request. Item data failure.' }

    //save file with new file name --------------------------------------------------------------------
    const file = req.file
    if (!file) throw { status: 400, data: 'Bad request. File upload failure.' }
    await db.query(`UPDATE ${type} SET img_url=$2 WHERE id=$1`, [
      id,
      file.originalname,
    ])
    res.json({ data: 'Image uploaded' })
  } catch (e) {
    next(e)
  }
}

export async function deleteItemImg(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.body)
    throw { status: 400, data: 'Bad request. Invalid query string.' }
  try {
    const type = req.params.type.toString()
    const id = Number(req.query.id)
    const getImgUrl = await db.query(
      `SELECT img_url FROM ${type} WHERE id=$1`,
      [id]
    )
    const url = getImgUrl.rows[0].img_url.toString()

    await db.query(`UPDATE ${type} SET img_url='' WHERE id=$1`, [id])
    await rm(`uploads/itm/${url}`)

    res.json({ data: 'Image removed' })
  } catch (e) {
    next(e)
  }
}
