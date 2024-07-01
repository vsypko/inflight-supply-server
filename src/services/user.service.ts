import db from '../db/db.js'
import bcrypt from 'bcrypt'
import { countryByIpQuery } from '../db/queries.js'
import { generateTokens } from './token.service.js'
import { ITokens, User } from '../types.js'

//------------------------------------------------------------------------------------------------------------------------

export async function signup(
  email: string,
  password: string,
  ip: string
): Promise<{
  user: User
  tokens: ITokens
}> {
  const checkEmail = await db.query('SELECT * FROM users WHERE email=$1', [
    email,
  ])
  if (checkEmail.rowCount != 0)
    throw { status: 400, data: 'Such user already exists' }
  const hashedPassword = await bcrypt.hash(password, 3)

  //The default user country will be set according to his IP------------------------------------------------
  const country_iso = await countryByIpQuery(ip)

  //The default user role will be set to "user"-------------------------------------------------------------
  const newUser = await db.query(
    'INSERT INTO users (email, password, country_iso) values ($1, $2, $3) RETURNING *',
    [email, hashedPassword, country_iso]
  )
  if (newUser.rowCount === 0)
    throw { status: 500, data: 'Internal server error' }
  // const user: User = newUser.rows[0]
  const data = await db.query(
    'SELECT u.id, u.firstname, u.lastname, u.email, u.img_url, r.role_name role, u.company_id, u.phone, u.country_iso, c.title_case country, c.phonecode, c.flag FROM users u INNER JOIN roles r ON role=role_id INNER JOIN countries c ON country_iso=iso WHERE u.id=$1',
    [newUser.rows[0].id]
  )
  const user: User = data.rows[0]
  const tokens = generateTokens({ id: user.id, role: user.role })
  return {
    user,
    tokens,
  }
}

//-----------------------------------------------------------------------------------------------------------------------

export async function signin(email: string, password: string) {
  const checkUser = await db.query('SELECT * FROM users WHERE email=$1', [
    email,
  ])
  if (checkUser.rowCount === 0)
    throw { status: 400, data: 'Such user not found!\n Please sign up' }
  const checkPassword = await bcrypt.compare(
    password,
    checkUser.rows[0].password
  )
  if (!checkPassword) throw { status: 400, data: 'Incorrect password' }
  const data = await db.query(
    'SELECT u.id, u.firstname, u.lastname, u.email, u.img_url, r.role_name role, u.company_id, u.phone, u.country_iso, c.title_case country, c.phonecode, c.flag FROM users u INNER JOIN roles r ON role=role_id INNER JOIN countries c ON country_iso=iso WHERE u.id=$1',
    [checkUser.rows[0].id]
  )
  const user: User = data.rows[0]
  const tokens = generateTokens({ id: user.id, role: user.role })
  let company = undefined
  if (user.company_id) {
    const data = await db.query(
      'SELECT co.id, co.category, co.name, co.reg_number, co.icao, co.iata, co.country_iso, cn.title_case country, co.city, co.address, co.link, cn.currency, cn.flag FROM companies co INNER JOIN countries cn ON country_iso=iso WHERE co.id=$1',
      [user.company_id]
    )
    company = data.rows[0]
  }
  return {
    user,
    company,
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
