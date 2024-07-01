import { Request, Response, NextFunction } from 'express'
import db from '../db/db.js'
import * as fs from 'fs'
import { User } from '../types.js'

export async function getUserPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!fs.existsSync(`uploads/uph/${req.params.url}`))
      throw { status: 400, data: 'Bad request. File load failure.' }
    const image = fs.readFileSync(`uploads/uph/${req.params.url}`)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Encoding', 'binary')
    res.send(image)
  } catch (e) {
    next(e)
  }
}

export async function saveUserPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.body.id
    if (!id) throw { status: 400, data: 'Bad request. User data failure.' }
    //get old image file url and delete it ----------------------------------------------------------
    const url = await db.query('SELECT img_url FROM users WHERE id=$1', [id])
    const oldUrl = url.rows[0].usr_url
    if (oldUrl) fs.unlinkSync(`uploads/uph/${oldUrl}`)

    //save file with new file name --------------------------------------------------------------------
    const file = req.file
    if (!file) throw { status: 400, data: 'Bad request. File upload failure.' }
    await db.query('UPDATE users SET img_url=$2 WHERE id=$1', [
      id,
      file.originalname,
    ])

    res.json({ data: 'Image uploaded' })
  } catch (e) {
    next(e)
  }
}

export async function removeUserPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await db.query("UPDATE users SET img_url='' WHERE img_url=$1", [
      req.params.url,
    ])
    fs.unlinkSync(`uploads/uph/${req.params.url}`)
    res.json({ data: 'Photo deleted successfully' })
  } catch (e) {
    next(e)
  }
}

export async function updateUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.body) throw { status: 400, data: 'Bad request. Incorrect data.' }
    const { id, firstname, lastname, phone, country_iso } = req.body

    const userData = await db.query(
      'UPDATE users SET firstname=$2, lastname=$3, phone=$4, country_iso=$5 WHERE id=$1 RETURNING *',
      [id, firstname, lastname, phone, country_iso]
    )
    if (userData.rowCount === 0)
      throw { status: 500, data: 'Internal server error.\n Database failure.' }
    const data = await db.query(
      'SELECT u.id, u.firstname, u.lastname, u.email, u.img_url, r.role_name role, u.company_id, u.phone, u.country_iso, c.title_case country, c.phonecode, c.flag FROM users u INNER JOIN roles r ON role=role_id INNER JOIN countries c ON country_iso=iso WHERE u.id=$1',
      [userData.rows[0].id]
    )
    const user: User = data.rows[0]
    res.json(user)
  } catch (e) {
    next(e)
  }
}

export async function checkUserAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export async function removeUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {}
