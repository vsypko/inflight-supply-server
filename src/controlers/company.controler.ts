import { Request, Response, NextFunction } from "express"
import db from "../db/db.js"
import { QueryResult } from "pg"
import * as fs from "fs"

export async function getData(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.params || !req.query) throw { status: 400, data: "Bad request" }
    if (req.params.tb_type === "flights") {
      const table = req.query.tb!.toString()
      const date = req.query.date!.toString()
      const result = await db.query(
        `SELECT id, TO_CHAR(date,'YYYY-MM-DD') as date, flight, type, reg, "from", "to", TO_CHAR(std,'HH24:MI') as std, to_char(sta,'HH24:MI') as sta, seats FROM ${table} WHERE date=$1::date ORDER BY "from" ASC, std ASC`,
        [date],
      )
      res.json(result.rows)
      return
    }
    if (req.params.tb_type === "fleet") {
      const table = req.query.tb!.toString()
      const result = await db.query(`SELECT * FROM ${table} ORDER BY reg`)
      res.json(result.rows)
      return
    }
    if (req.params.tb_type === "supplies") {
      const table = req.query.tb!.toString()
      const result = await db.query(`SELECT * FROM ${table} ORDER BY code ASC, category ASC`)
      res.json(result.rows)
      return
    }
    const table = req.query.tb!.toString()
    const result = await db.query(`SELECT * FROM ${table}`)
    console.log(result.rows)

    res.json(result.rows)
  } catch (e) {
    next(e)
  }
}

export async function insertData(req: Request, res: Response, next: NextFunction) {
  let result: QueryResult<any>
  try {
    if (!req.params) throw { status: 400, data: "Bad request. No params found." }
    const table = req.body.tb!.toString()
    const data = req.body.values
    if (!data) throw { status: 400, data: "Bad request. File data failure." }
    if (req.params.tb_type === "flights") {
      result = await db.query(
        `INSERT INTO ${table} (date, flight, type, reg, "from", "to", std, sta, seats) VALUES ${data}`,
      )
      res.json({ data: `Inserted ${result.rowCount} rows` })
      return
    }
    if (req.params.tb_type === "fleet") {
      result = await db.query(`INSERT INTO ${table} (name, type, reg, seats) VALUES ${data}`)
      res.json({ data: `Inserted ${result.rowCount} rows` })
      return
    }
    if (req.params.tb_type === "supplies") {
      result = await db.query(
        `INSERT INTO ${table} (code, title, price, category, area, description, img_url) VALUES ${data} RETURNING*`,
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
    const table = req.body.tb!.toString()
    const data = req.body.value
    if (req.params.tb_type === "flight") {
      await db.query(
        `UPDATE ${table} SET date=$2::date, flight=$3, type=$4, reg=$5, "from"=$6, "to"=$7, std=$8, sta=$9, seats=$10 WHERE id=$1`,
        [data.id, data.date, data.flight, data.type, data.reg, data.from, data.to, data.std, data.sta, data.seats],
      )
      res.json({ data: "Flight has been updated" })
      return
    }
    if (req.params.tb_type === "fleet") {
      await db.query(`UPDATE ${table} SET name=$2, type=$3, reg=$4, seats=$5 WHERE id=$1`, [
        data.id,
        data.name,
        data.type,
        data.reg,
        data.seats,
      ])
      res.json({ data: "Aircraft has been updated" })
      return
    }
    if (req.params.tb_type === "supplies") {
      //get old image file url if exists and delete it ----------------------------------------------------------
      if (data.id) {
        const url = await db.query(`SELECT img_url FROM ${table} WHERE id=$1`, [data.id])
        const oldUrl = url.rows[0].img_url
        if (oldUrl && oldUrl !== "undefined") fs.unlinkSync(`uploads/itm/${oldUrl}`)
      }
      await db.query(
        `UPDATE ${table} SET code=$2, title=$3, price=$4, category=$5, area=$6, description=$7, img_url=$8 WHERE id=$1`,
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
  if (!req.query) throw { status: 400, data: "Bad request. No query found." }
  try {
    const table = req.query.tb!.toString()
    const id = Number(req.query.id)
    if (!id || !table) throw { status: 400, data: "Bad request. Item data failure." }
    await db.query(`DELETE FROM ${table} WHERE id=$1`, [id])
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
    const table = req.body.tb!.toString()
    if (!table) throw { status: 400, data: "Bad request. Item data failure." }

    //save file with new file name --------------------------------------------------------------------
    const file = req.file
    if (!file) throw { status: 400, data: "Bad request. File upload failure." }
    await db.query(`UPDATE ${table} SET img_url=$2 WHERE id=$1`, [id, file.originalname])
    res.json({ data: "Image uploaded" })
  } catch (e) {
    next(e)
  }
}

export async function deleteImg(req: Request, res: Response, next: NextFunction) {
  if (!req.body) throw { status: 400, data: "Bad request. No query found." }
  try {
    const table = req.body.tb!.toString()
    await db.query(`UPDATE ${table} SET img_url='' WHERE img_url=$1`, [req.params.url])
    fs.unlinkSync(`uploads/itm/${req.params.url}`)
    res.json({ data: "Image deleted successfully" })
  } catch (e) {
    next(e)
  }
}
