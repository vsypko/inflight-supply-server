import db from "../db/db.js"
import bcrypt from "bcrypt"
import {
  companyByIdQuery,
  countryByISOQuery,
  userByIdQuery,
  userEmailCheckQuery,
  userInsertQuery,
} from "../db/queries.js"
import { generateTokens } from "./token.service.js"
import { ICompany, ICountry, ITokens, IUser } from "../types.js"

//------------------------------------------------------------------------------------------------------------------------

export async function signup(
  email: string,
  password: string,
  country_iso: string,
): Promise<{
  user: IUser | undefined
  company: ICompany | undefined
  country: ICountry | undefined
  tokens: ITokens | undefined
}> {
  const checkEmail = await db.query(userEmailCheckQuery(email))
  if (checkEmail.rowCount != 0) throw { status: 400, data: "Such user already exists" }
  const hashedPassword = await bcrypt.hash(password, 3)
  const newUser = await db.query(userInsertQuery(email, hashedPassword))
  if (newUser.rowCount === 0) throw { status: 500, data: "Internal server error" }
  const { usr_id: id, usr_role: role } = newUser.rows[0]
  const tokens = generateTokens({ id, role })
  const { user, company, country } = await getUserData(id, country_iso)
  return {
    user,
    company,
    country,
    tokens,
  }
}

//-----------------------------------------------------------------------------------------------------------------------

export async function signin(email: string, password: string, country_iso: string) {
  const checkUser = await db.query(userEmailCheckQuery(email))

  if (checkUser.rowCount === 0) throw { status: 400, data: "Such user not found!\n Please sign up" }

  const checkPassword = await bcrypt.compare(password, checkUser.rows[0].usr_password)
  if (!checkPassword) throw { status: 400, data: "Incorrect password" }
  const { usr_id: id, usr_role: role } = checkUser.rows[0]
  const tokens = generateTokens({ id, role })
  const { user, company, country } = await getUserData(id, country_iso)
  return {
    user,
    company,
    country,
    tokens,
  }
}

//----------------------------------------------------------------------------------------------------------------------

export async function getUserData(
  id: number,
  country_iso?: string,
): Promise<{ user: IUser | undefined; company: ICompany | undefined; country: ICountry | undefined }> {
  let user: IUser | undefined
  let company: ICompany | undefined
  let country: ICountry | undefined

  const userData = await db.query(userByIdQuery(id))
  if (userData.rowCount === 0) throw { status: 500, data: "Internal server error" }
  user = userData.rows[0]

  if (user && user.usr_co) {
    let companyData = await db.query(companyByIdQuery(user.usr_co))
    if (companyData.rowCount === 0) throw { status: 500, data: "Internal server error" }

    company = companyData.rows[0]

    if (company && company.co_country_iso) {
      let countryData = await db.query(countryByISOQuery(company.co_country_iso))
      if (countryData.rowCount === 0) {
        company = undefined
      } else {
        company!.co_country_name = countryData.rows[0].cn_case_name
        company!.co_country_flag = countryData.rows[0].cn_flag
      }
    }
  }
  if (country_iso && user && !user.usr_cn) {
    const countryData = await db.query(countryByISOQuery(country_iso))
    if (countryData.rowCount === 0) {
      country = undefined
    } else {
      country = countryData.rows[0]
    }
  }

  return { user, company, country }
}
