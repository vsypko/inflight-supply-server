import { Request, Response, NextFunction } from "express"
import db from "../db/db.js"
import { QueryResult } from "pg"
import * as fs from "fs"

export async function getCompany(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.query) throw { status: 400, data: "Bad request" }
    const companies = await db.query(`SELECT * FROM companies WHERE name ILIKE '%${req.query.q}%'`)
    if (companies) res.send({ total_count: companies.rowCount, companies: companies.rows })
  } catch (e) {
    next(e)
  }
}

export async function getData(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.params || !req.query) throw { status: 400, data: "Bad request" }
    if (req.params.type === "flights") {
      const date = req.query.date!.toString()
      const result = await db.query(
        `SELECT id, TO_CHAR(date,'YYYY-MM-DD') as date, flight, type, reg, "from", "to", TO_CHAR(std,'HH24:MI') as std, to_char(sta,'HH24:MI') as sta, seats, co_id, co_iata FROM flights WHERE co_id=$1 AND date=$2::date ORDER BY "from" ASC, std ASC`,
        [req.query.id, date],
      )
      res.json(result.rows)
      return
    }
    if (req.params.type === "fleet") {
      const result = await db.query(`SELECT * FROM fleet WHERE co_id=$1 ORDER BY reg`, [req.query.id])
      res.json(result.rows)
      return
    }
    if (req.params.type === "supplies") {
      const result = await db.query(`SELECT * FROM supplies WHERE co_id=$1 ORDER BY code ASC, category ASC`, [
        req.query.id,
      ])
      res.json(result.rows)
      return
    }
    const result = await db.query(`SELECT * FROM companies`)
    res.json(result.rows)
  } catch (e) {
    next(e)
  }
}

export async function insertData(req: Request, res: Response, next: NextFunction) {
  let result: QueryResult<any>
  try {
    if (!req.params) throw { status: 400, data: "Bad request. No params found." }
    const data = req.body.values
    if (!data) throw { status: 400, data: "Bad request. File data failure." }

    if (req.params.type === "flights") {
      result = await db.query(
        `INSERT INTO flights (date, flight, type, reg, "from", "to", std, sta, seats, co_id, co_iata) VALUES ${data}`,
      )
      res.json({ data: `Inserted ${result.rowCount} rows` })
      return
    }

    if (req.params.type === "fleet") {
      result = await db.query(`INSERT INTO fleet (name, type, reg, seats, co_id) VALUES ${data}`)
      res.json({ data: `Inserted ${result.rowCount} rows` })
      return
    }

    if (req.params.type === "supplies") {
      result = await db.query(
        `INSERT INTO supplies (code, title, price, category, area, description, img_url, co_id) VALUES ${data} RETURNING*`,
      )
      res.json({ data: `Inserted ${result.rowCount} rows`, id: result.rows[0].id })
      return
    }

    res.json({ data: "No data found" })
  } catch (e) {
    console.log(e)
    next(e)
  }
}

export async function updateData(req: Request, res: Response, next: NextFunction) {
  if (!req.params) throw { status: 400, data: "Bad request. No params found." }
  try {
    const data = req.body.value
    if (req.params.type === "flights") {
      await db.query(
        `UPDATE flights SET date=$2::date, flight=$3, type=$4, reg=$5, "from"=$6, "to"=$7, std=$8, sta=$9, seats=$10 WHERE id=$1`,
        [data.id, data.date, data.flight, data.type, data.reg, data.from, data.to, data.std, data.sta, data.seats],
      )
      res.json({ data: "Flight has been updated" })
      return
    }
    if (req.params.type === "fleet") {
      await db.query(`UPDATE fleet SET name=$2, type=$3, reg=$4, seats=$5 WHERE id=$1`, [
        data.id,
        data.name,
        data.type,
        data.reg,
        data.seats,
      ])
      res.json({ data: "Aircraft has been updated" })
      return
    }
    if (req.params.type === "supplies") {
      //get old image file url if exists and delete it ----------------------------------------------------------
      if (data.id) {
        const url = await db.query(`SELECT img_url FROM supplies WHERE id=$1`, [data.id])
        const oldUrl = url.rows[0].img_url
        if (oldUrl && oldUrl !== "undefined") fs.unlinkSync(`uploads/itm/${oldUrl}`)
      }
      await db.query(
        `UPDATE supplies SET code=$2, title=$3, price=$4, category=$5, area=$6, description=$7, img_url=$8 WHERE id=$1`,
        [data.id, data.code, data.title, data.price, data.category, data.area, data.description, data.img_url],
      )
      res.json({ data: "Item has been updated" })
      return
    }
    res.json({ data: "No data found" })
  } catch (e) {
    next(e)
  }
}

export async function deleteData(req: Request, res: Response, next: NextFunction) {
  if (!req.query && !req.params) throw { status: 400, data: "Bad request. No query found." }
  try {
    const type = req.params.type.toString()
    const id = Number(req.query.id)
    if (!id || !type) throw { status: 400, data: "Bad request. Item data failure." }

    if (type === "supplies") {
      const getImgUrl = await db.query(`SELECT img_url FROM ${type} WHERE id=$1`, [id])
      const url = getImgUrl.rows[0].img_url.toString()
      if (url && url !== "undefined") fs.unlinkSync(`uploads/itm/${url}`)
    }

    await db.query(`DELETE FROM ${type} WHERE id=$1`, [id])

    res.json({ data: "Data row has been deleted" })
  } catch (e) {
    next(e)
  }
}

export async function getImgUrl(req: Request, res: Response, next: NextFunction) {
  try {
    if (!fs.existsSync(`uploads/itm/${req.params.url}`)) throw { status: 400, data: "Bad request. File load failure." }
    const image = fs.readFileSync(`uploads/itm/${req.params.url}`)
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Content-Encoding", "binary")
    res.send(image)
  } catch (e) {
    next(e)
  }
}

export async function updateImg(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.body.id
    const type = req.body.type.toString()
    if (!type) throw { status: 400, data: "Bad request. Item data failure." }

    //save file with new file name --------------------------------------------------------------------
    const file = req.file
    if (!file) throw { status: 400, data: "Bad request. File upload failure." }
    await db.query(`UPDATE ${type} SET img_url=$2 WHERE id=$1`, [id, file.originalname])
    res.json({ data: "Image uploaded" })
  } catch (e) {
    next(e)
  }
}

export async function deleteImg(req: Request, res: Response, next: NextFunction) {
  if (!req.body) throw { status: 400, data: "Bad request. Invalid query string." }
  try {
    const type = req.params.type.toString()
    const id = Number(req.query.id)
    const getImgUrl = await db.query(`SELECT img_url FROM ${type} WHERE id=$1`, [id])
    const url = getImgUrl.rows[0].img_url.toString()

    await db.query(`UPDATE ${type} SET img_url='' WHERE id=$1`, [id])
    fs.unlinkSync(`uploads/itm/${url}`)

    res.json({ data: "Image removed" })
  } catch (e) {
    next(e)
  }
}
