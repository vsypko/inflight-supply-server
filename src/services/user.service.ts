import db from '../db/db.js'
import bcrypt from 'bcrypt'
import { generateTokens } from './token.service.js'
import { ITokens, User } from '../types.js'

//SIGN UP SERVICE --------------------------------------------------------------------------------------------------------

export async function signup(
  email: string,
  password: string,
  ip: string
): Promise<{
  user: User
  tokens: ITokens
}> {
  const resultEmail = await db.query('SELECT * FROM users WHERE email=$1', [
    email,
  ])
  if (resultEmail.rowCount != 0)
    throw { status: 400, data: 'Such user already exists' }
  const hashedPassword = await bcrypt.hash(password, 3)

  //The default user country will be set according to his IP------------------------------------------------
  const country_iso = await countryByIpQuery(ip)

  //The default user role will be set to "user"-------------------------------------------------------------
  const resultUser = await db.query(
    'INSERT INTO users (email, password, country_iso) values ($1, $2, $3) RETURNING *',
    [email, hashedPassword, country_iso]
  )
  if (resultUser.rowCount === 0)
    throw { status: 500, data: 'Internal server error' }
  // const user: User = newUser.rows[0]
  const result = await db.query(
    'SELECT u.id, u.firstname, u.lastname, u.email, u.img_url, r.role_name role, u.company_id, u.phone, u.country_iso, c.title_case country, c.phonecode, c.flag FROM users u INNER JOIN roles r ON role=role_id INNER JOIN countries c ON country_iso=iso WHERE u.id=$1',
    [resultUser.rows[0].id]
  )
  const user: User = result.rows[0]
  const tokens = generateTokens({ id: user.id, role: user.role })
  return {
    user,
    tokens,
  }
}

//SIGN IN SERVICE -------------------------------------------------------------------------------------------------------

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

  const result = await db.query(
    'SELECT u.id, u.firstname, u.lastname, u.email, u.img_url, r.role_name role, u.company_id, u.phone, u.country_iso, c.title_case country, c.phonecode, c.flag FROM users u INNER JOIN roles r ON role=role_id INNER JOIN countries c ON country_iso=iso WHERE u.id=$1',
    [checkUser.rows[0].id]
  )

  const user: User = result.rows[0]
  const tokens = generateTokens({ id: user.id, role: user.role })
  let company = undefined

  if (user.company_id) {
    const result = await db.query(
      'SELECT co.id, co.category, co.name, co.reg_number, co.icao, co.iata, co.country_iso, cn.title_case country, co.city, co.address, co.link, cn.currency, cn.flag FROM companies co INNER JOIN countries cn ON country_iso=iso WHERE co.id=$1',
      [user.company_id]
    )
    company = result.rows[0]
  }

  return {
    user,
    company,
    tokens,
  }
}

async function countryByIpQuery(ip: string): Promise<string> {
  if (ip.includes('::ffff:')) {
    ip = ip.replace('::ffff:', '')
  }

  if (
    ip.includes('127.0.0.1') ||
    (ip.includes('192.168.') && ip.indexOf('192.168.') === 0)
  ) {
    return 'AT'
  }

  if (ip.includes('.')) {
    const country_iso = await db.query(
      'SELECT ip_cn FROM ipv4 WHERE $1 BETWEEN ip_from AND ip_to',
      [ip]
    )
    if (country_iso.rowCount !== 0) return country_iso.rows[0].ip_cn
  }

  const country_iso = await db.query(
    'SELECT ip_cn FROM ipv6 WHERE $1 BETWEEN ip_from AND ip_to',
    [ip]
  )

  if (country_iso.rowCount !== 0) return country_iso.rows[0].ip_cn
  return 'AT'
}
