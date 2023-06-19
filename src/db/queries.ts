import db from "./db.js"

export const airportQuery = (search: string) => ({
  name: "airport",
  text: "SELECT ap_id, ap_type, ap_name, ap_latitude, ap_longitude, ap_elevation_ft, ap_continent, ap_country, ap_iso_country, ap_iso_region, ap_municipality, ap_scheduled, ap_icao_code, ap_iata_code, ap_home_link FROM airports WHERE ts_ap @@ to_tsquery($1) order by ap_name",
  values: [search],
})

export const userEmailCheckQuery = (email: string) => ({
  name: "email-check",
  text: "SELECT id, password, role FROM users WHERE email=$1",
  values: [email],
})

export const userInsertQuery = (email: string, password: string, country: string) => ({
  name: "insert-user",
  text: "INSERT INTO users (email, password, country) values ($1, $2, $3) RETURNING *",
  values: [email, password, country],
})

export const userGetUrlQuery = (id: number) => ({
  name: "get-user-url",
  text: "SELECT img_url FROM users WHERE id=$1",
  values: [id],
})

export const userInsertUrlQuery = (id: number, url: string) => ({
  name: "insert-user-url",
  text: "UPDATE users SET img_url=$2 WHERE id=$1",
  values: [id, url],
})

export const userRemoveUrlQuery = (url: string) => ({
  name: "delete-user-url",
  text: "UPDATE users SET img_url='' WHERE img_url=$1",
  values: [url],
})

export const userByIdQuery = (id: number) => ({
  name: "user-by-id",
  text: "SELECT id, firstname, lastname, email, img_url, role_name as role, company, phone, country FROM users INNER JOIN roles ON role=role_id WHERE id=$1",
  values: [id],
})

export const companyByIdQuery = (id: number) => ({
  name: "country-by-id",
  text: "SELECT id, name, category, iata, country, table1, table2 FROM companies WHERE id=$1",
  values: [id],
})

export const countryByISOQuery = (country_iso: string) => ({
  name: "country-by-iso",
  text: "SELECT iso, title_case, phonecode, currency, flag FROM countries WHERE iso=$1",
  values: [country_iso],
})

export async function countryByIpQuery(ip: string): Promise<string> {
  if (ip.includes("::ffff:")) {
    ip = ip.replace("::ffff:", "")
  }
  if (ip.includes("127.0.0.1") || (ip.includes("192.168.") && ip.indexOf("192.168.") === 0)) {
    return "UA"
  }
  if (ip.includes(".")) {
    const country_iso = await db.query(countryByIpv4Query(ip))
    if (country_iso.rowCount !== 0) return country_iso.rows[0].ip_cn
  }
  const country_iso = await db.query(countryByIpv6Query(ip))
  if (country_iso.rowCount !== 0) return country_iso.rows[0].ip_cn
  return "UA"
}

export const countryByIpv4Query = (ip: string) => ({
  name: "country-by-ipv4",
  text: "SELECT ip_cn FROM ipv4 WHERE $1 BETWEEN ip_from AND ip_to;",
  values: [ip],
})

export const countryByIpv6Query = (ip: string) => ({
  name: "country-by-ipv6",
  text: "SELECT ip_cn FROM ipv6 WHERE $1 BETWEEN ip_from AND ip_to;",
  values: [ip],
})

export const userUpdateProfileQuery = ({
  id,
  firstname,
  lastname,
  phone,
  country,
}: {
  id: number
  firstname: string
  lastname: string
  phone: string
  country: string
}) => ({
  name: "insert-user-profile",
  text: "UPDATE users SET firstname=$2, lastname=$3, phone=$4, country=$5 WHERE id=$1 RETURNING *",
  values: [id, firstname, lastname, phone, country],
})

export const allUsersQuery = (column?: string, value?: number) => {
  let search = ""
  if (column && value) search = `WHERE ${column}=${value}`
  return {
    name: column ? "team" : "all-users",
    text: `SELECT id, firstname, lastname, email, img_url, role_name as role, company, phone, country FROM users INNER JOIN roles ON role=role_id ${search}`,
  }
}

export const allCountriesQuery = () => ({
  name: "all-countries",
  text: "SELECT iso, title_case, phonecode, currency, flag FROM countries ORDER BY title_case",
})
