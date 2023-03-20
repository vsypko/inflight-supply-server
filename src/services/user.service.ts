import db from "../db/db.js"
import bcrypt from "bcrypt"
import { userByIdQuery, userEmailCheckQuery, userInsertQuery } from "../db/queries.js"
import { generateTokens } from "./token.service.js"
import { IUserResponse } from "../types.js"

export async function signup(email: string, password: string): Promise<IUserResponse> {
  const checkEmail = await db.query(userEmailCheckQuery(email))

  if (checkEmail.rowCount != 0) throw { status: 400, data: "Such user already exists!" }
  const hashedPassword = await bcrypt.hash(password, 3)
  const newUser = await db.query(userInsertQuery(email, hashedPassword, 4))
  const user = newUser.rows[0]
  const tokens = generateTokens({ id: user.usr_id, role: user.usr_role })

  return {
    user,
    tokens,
  }
}

export async function signin(email: string, password: string): Promise<IUserResponse> {
  const checkUser = await db.query(userEmailCheckQuery(email))
  if (checkUser.rowCount === 0) throw { status: 400, data: "Such user not found!\n Please sign up" }

  const checkPassword = await bcrypt.compare(password, checkUser.rows[0].usr_password)
  if (!checkPassword) throw { status: 400, data: "Incorrect password" }
  const id = checkUser.rows[0].usr_id
  const role = checkUser.rows[0].usr_role
  const tokens = generateTokens({ id, role })
  const user = await getUser(id)
  return {
    user,
    tokens,
  }
}

export async function getUser(id: number) {
  const user = await db.query(userByIdQuery(id))
  return user.rows[0]
}
