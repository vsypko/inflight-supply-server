import db from "../db/db.js"
import bcrypt from "bcrypt"
import {
  companyByIdQuery,
  countryByIpQuery,
  countryByISOQuery,
  userByIdQuery,
  userEmailCheckQuery,
  userInsertQuery,
} from "../db/queries.js"
import { generateTokens } from "./token.service.js"
import { ITokens, User } from "../types.js"

//------------------------------------------------------------------------------------------------------------------------

export async function signup(
  email: string,
  password: string,
  ip: string,
): Promise<{
  user: User
  tokens: ITokens
}> {
  const checkEmail = await db.query(userEmailCheckQuery(email))
  if (checkEmail.rowCount != 0) throw { status: 400, data: "Such user already exists" }
  const hashedPassword = await bcrypt.hash(password, 3)

  //The default user country will be set according to his IP------------------------------------------------
  const country_iso = await countryByIpQuery(ip)

  //The default user role will be set to "user"-------------------------------------------------------------
  const newUser = await db.query(userInsertQuery(email, hashedPassword, country_iso))
  if (newUser.rowCount === 0) throw { status: 500, data: "Internal server error" }
  // const user: User = newUser.rows[0]
  const data = await db.query(userByIdQuery(newUser.rows[0].id))
  const user: User = data.rows[0]
  const tokens = generateTokens({ id: user.id, role: user.role })
  return {
    user,
    tokens,
  }
}

//-----------------------------------------------------------------------------------------------------------------------

export async function signin(email: string, password: string) {
  const checkUser = await db.query(userEmailCheckQuery(email))
  if (checkUser.rowCount === 0) throw { status: 400, data: "Such user not found!\n Please sign up" }
  const checkPassword = await bcrypt.compare(password, checkUser.rows[0].password)
  if (!checkPassword) throw { status: 400, data: "Incorrect password" }
  // const user = checkUser.rows[0]
  const data = await db.query(userByIdQuery(checkUser.rows[0].id))
  const user: User = data.rows[0]
  const tokens = generateTokens({ id: user.id, role: user.role })
  return {
    user,
    tokens,
  }
}

//----------------------------------------------------------------------------------------------------------------------

// export async function getUserData(
//   id: number,
// ): Promise<{ user: User; company: ICompany | undefined; country: ICountry }> {
//   let user: User
//   let company: ICompany | undefined
//   let country: ICountry
//   //-----get user-----------------------------------------------------------------
//   const userData = await db.query(userByIdQuery(id))
//   if (userData.rowCount === 0) throw { status: 500, data: "Internal server error.\n Database failure." }
//   user = userData.rows[0]

//   //---get user company if exists----------------------------------------------

//   if (user.company) {
//     const companyData = await db.query(companyByIdQuery(user.company))
//     if (!companyData || companyData.rowCount === 0)
//       throw { status: 500, data: "Internal server error.\n Database failure." }
//     // const countryData = await db.query(countryByISOQuery(companyData.rows[0].country))
//     company = companyData.rows[0]
//   }
//   //---get user country --------------------------------------------------------
//   const countryData = await db.query(countryByISOQuery(user.country))
//   if (countryData.rowCount === 0) throw { status: 500, data: "Internal server error.\n Database failure." }
//   country = countryData.rows[0]
//   return { user, company, country }
// }
