import { Request, Response, NextFunction } from 'express'
import db from '../db/db.js'
import { readFile, access, unlink } from 'node:fs/promises'
import { User } from '../types.js'

// GET USER IMAGE FILE BY IT NAME --------------------------------------------------
export async function getUserPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filePath = `/usr/uploads/uph/${req.params.url}`
    await access(filePath)
    const image = await readFile(filePath)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Encoding', 'binary')
    res.send(image)
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      res.status(404).json({ message: 'File not found.' })
    } else {
      next(e)
    }
  }
}

//SAVE USER IMAGE WITH NAME FROM REQUEST --------------------------------------------------
export async function saveUserPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.body.id
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

//DELETE USER IMAGE FILE AND IT NAME FROM DB----------------------------------------------

export async function removeUserPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await db.query("UPDATE users SET img_url='' WHERE img_url=$1", [
      req.params.url,
    ])

    const filePath = `/usr/uploads/uph/${req.params.url}`

    await access(filePath)

    await unlink(filePath)

    res.json({ data: 'Photo deleted successfully' })
  } catch (e) {
    next(e)
  }
}

//UPDATE USER DATA FUNCTION ---------------------------------------------------------------

export async function updateUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.body) throw { status: 400, data: 'Bad request. Incorrect data.' }

    const { id, firstname, lastname, phone, country_iso } = req.body

    const resultUpdateUser = await db.query(
      'UPDATE users SET firstname=$2, lastname=$3, phone=$4, country_iso=$5 WHERE id=$1 RETURNING *',
      [id, firstname, lastname, phone, country_iso]
    )

    if (resultUpdateUser.rowCount === 0)
      throw { status: 500, data: 'Internal server error.\n Database failure.' }

    const result = await db.query(
      'SELECT u.id, u.firstname, u.lastname, u.email, u.img_url, r.role_name role, u.company_id, u.phone, u.country_iso, c.title_case country, c.phonecode, c.flag FROM users u INNER JOIN roles r ON role=role_id INNER JOIN countries c ON country_iso=iso WHERE u.id=$1',
      [resultUpdateUser.rows[0].id]
    )
    const user: User = result.rows[0]
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
