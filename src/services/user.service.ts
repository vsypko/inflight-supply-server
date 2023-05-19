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
import { ICompany, ICountry, ITokens, IUser } from "../types.js"

//------------------------------------------------------------------------------------------------------------------------

export async function signup(
  email: string,
  password: string,
  ip: string,
): Promise<{
  user: IUser
  company: ICompany | undefined
  country: ICountry
  tokens: ITokens
}> {
  const checkEmail = await db.query(userEmailCheckQuery(email))
  if (checkEmail.rowCount != 0) throw { status: 400, data: "Such user already exists" }
  const hashedPassword = await bcrypt.hash(password, 3)
  const newUser = await db.query(userInsertQuery(email, hashedPassword))
  if (newUser.rowCount === 0) throw { status: 500, data: "Internal server error" }
  const { id: id, usr_role: role } = newUser.rows[0]
  const tokens = generateTokens({ id, role })
  const { user, company, country } = await getUserData(id, ip)
  return {
    user,
    company,
    country,
    tokens,
  }
}

//-----------------------------------------------------------------------------------------------------------------------

export async function signin(email: string, password: string, ip: string) {
  const checkUser = await db.query(userEmailCheckQuery(email))
  if (checkUser.rowCount === 0) throw { status: 400, data: "Such user not found!\n Please sign up" }
  const checkPassword = await bcrypt.compare(password, checkUser.rows[0].usr_password)
  if (!checkPassword) throw { status: 400, data: "Incorrect password" }
  const { id: id, usr_role: role } = checkUser.rows[0]
  const tokens = generateTokens({ id, role })
  const { user, company, country } = await getUserData(id, ip)
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
  ip: string,
): Promise<{ user: IUser; company: ICompany | undefined; country: ICountry }> {
  let user: IUser
  let company: ICompany | undefined
  let country: ICountry
  let country_iso: string
  //-----get user-----------------------------------------------------------------
  const userData = await db.query(userByIdQuery(id))
  if (userData.rowCount === 0) throw { status: 500, data: "Internal server error.\n Database failure." }
  user = userData.rows[0]

  //---get user company an company country if exists----------------------------------------------

  if (user.usr_co) {
    const companyData = await db.query(companyByIdQuery(user.usr_co))
    if (companyData.rowCount === 0) throw { status: 500, data: "Internal server error.\n Database failure." }
    company = companyData.rows[0]
    if (company && company.co_cn) {
      const countryData = await db.query(countryByISOQuery(company.co_cn))
      if (countryData.rowCount === 0) {
        company = undefined
      } else {
        company.co_cn_name = countryData.rows[0].title_case
        company.co_cn_currency = countryData.rows[0].currency
        company.co_cn_flag = countryData.rows[0].flag
      }
    }
  }
  //---get user country if exists or by ip-----------------------------------------------------------------
  if (user.usr_cn && user.usr_cn != "ZZ") {
    country_iso = user.usr_cn
  } else {
    // country_iso = await countryByIpQuery(ip)
    // country_iso = await countryByIpQuery("45.138.10.61")
    // country_iso = await countryByIpQuery("93.72.42.167")
    country_iso = await countryByIpQuery("89.144.220.16")
  }
  const countryData = await db.query(countryByISOQuery(country_iso))
  if (countryData.rowCount === 0) throw { status: 500, data: "Internal server error.\n Database failure." }
  country = countryData.rows[0]
  return { user, company, country }
}
