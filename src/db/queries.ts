import db from './db.js'

export const userInsertQuery = (
  email: string,
  password: string,
  country: string
) => ({
  name: 'insert-user',
  text: 'INSERT INTO users (email, password, country_iso) values ($1, $2, $3) RETURNING *',
  values: [email, password, country],
})

export const userGetUrlQuery = (id: number) => ({
  name: 'get-user-url',
  text: 'SELECT img_url FROM users WHERE id=$1',
  values: [id],
})

export const userInsertUrlQuery = (id: number, url: string) => ({
  name: 'insert-user-url',
  text: 'UPDATE users SET img_url=$2 WHERE id=$1',
  values: [id, url],
})

export const userRemoveUrlQuery = (url: string) => ({
  name: 'delete-user-url',
  text: "UPDATE users SET img_url='' WHERE img_url=$1",
  values: [url],
})

export const userByIdQuery = (id: number) => ({
  name: 'user-by-id',
  text: 'SELECT u.id, u.firstname, u.lastname, u.email, u.img_url, r.role_name role, u.company_id, u.phone, u.country_iso, c.title_case country, c.phonecode, c.flag FROM users u INNER JOIN roles r ON role=role_id INNER JOIN countries c ON country_iso=iso WHERE u.id=$1',
  values: [id],
})

export const companyByIdQuery = (id: number) => ({
  name: 'country-by-id',
  text: 'SELECT co.id, co.category, co.name, co.reg_number, co.icao, co.iata, co.country_iso, cn.title_case country, co.city, co.address, co.link, cn.currency, cn.flag FROM companies co INNER JOIN countries cn ON country_iso=iso WHERE co.id=$1',
  values: [id],
})

export const countryByISOQuery = (country_iso: string) => ({
  name: 'country-by-iso',
  text: 'SELECT * FROM countries WHERE iso=$1',
  values: [country_iso],
})

export async function countryByIpQuery(ip: string): Promise<string> {
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
  return 'UA'
}

export const userUpdateProfileQuery = ({
  id,
  firstname,
  lastname,
  phone,
  country_iso,
}: {
  id: number
  firstname: string
  lastname: string
  phone: string
  country_iso: string
}) => ({
  name: 'update-user-profile',
  text: 'UPDATE users SET firstname=$2, lastname=$3, phone=$4, country_iso=$5 WHERE id=$1 RETURNING *',
  values: [id, firstname, lastname, phone, country_iso],
})

export const allUsersQuery = (column?: string, value?: number) => {
  let search = ''
  if (column && value) search = `WHERE ${column}=${value}`
  return {
    name: column ? 'team' : 'all-users',
    text: `SELECT id, firstname, lastname, email, img_url, role_name as role, company_id, phone, country_iso FROM users INNER JOIN roles ON role=role_id ${search}`,
  }
}
