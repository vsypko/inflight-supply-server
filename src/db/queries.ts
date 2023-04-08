import { ISchedule } from "../types.js"
import db from "./db.js"

export const airportQuery = (search: string) => ({
  name: "airport",
  text: "SELECT ap_id, ap_type, ap_name, ap_latitude, ap_longitude, ap_elevation_ft, ap_continent, ap_country, ap_iso_country, ap_iso_region, ap_municipality, ap_scheduled, ap_icao_code, ap_iata_code, ap_home_link FROM airports WHERE ts_ap @@ to_tsquery($1) order by ap_name",
  values: [search],
})

export const userEmailCheckQuery = (email: string) => ({
  name: "email-check",
  text: "SELECT usr_id, usr_password, usr_role FROM users WHERE usr_email=$1",
  values: [email],
})

export const userInsertQuery = (email: string, password: string) => ({
  name: "insert-user",
  text: "INSERT INTO users (usr_email, usr_password) values ($1, $2) RETURNING *",
  values: [email, password],
})

export const userInsertUrlQuery = (id: string, url: string) => ({
  name: "insert-user-url",
  text: "UPDATE users SET usr_url=$2 WHERE usr_id=$1",
  values: [id, url],
})

export const userRemoveUrlQuery = (url: string) => ({
  name: "delete-user-url",
  text: "UPDATE users SET usr_url='' WHERE usr_url=$1",
  values: [url],
})

export const userByIdQuery = (id: number) => ({
  name: "user-by-id",
  text: "SELECT usr_id, usr_firstname, usr_lastname, usr_email, usr_url, role_name as usr_role_name, usr_co, usr_phone, usr_cn FROM users INNER JOIN roles ON usr_role=role_id WHERE usr_id=$1",
  values: [id],
})

export const companyByIdQuery = (id: number) => ({
  name: "country-by-id",
  text: "SELECT co_name, co_category, co_iata_code, co_cn FROM company WHERE co_id=$1",
  values: [id],
})
export const companyInsertScheduleQuery = (schedule: string) => ({
  name: "insert-schedule",
  text: `INSERT INTO airline (fl_date, fl_num,fl_ac_iata,fl_ac_reg,fl_from,fl_to,fl_std,fl_sta,fl_ac_sts) VALUES ${schedule}`,
})

export const countryByISOQuery = (country_iso: string) => ({
  name: "country-by-iso",
  text: "SELECT cn_iso, cn_case_name, cn_phonecode, cn_flag FROM country WHERE cn_iso=$1",
  values: [country_iso],
})

export async function countryByIpQuery(ip: string): Promise<string> {
  if (ip.includes("::ffff:")) {
    ip = ip.replace("::ffff:", "")
  }
  if (ip.includes("127.0.0.1") || (ip.includes("192.168.") && ip.indexOf("192.168.") === 0)) {
    return "ZZ"
  }
  if (ip.includes(".")) {
    const country_iso = await db.query(countryByIpv4Query(ip))
    if (country_iso.rowCount != 0) return country_iso.rows[0].ip_cn
  }
  const country_iso = await db.query(countryByIpv6Query(ip))
  if (country_iso.rowCount != 0) return country_iso.rows[0].ip_cn
  return "ZZ"
}

export const countryByIpv4Query = (ip: string) => ({
  name: "country-by-ipv4",
  text: "SELECT ip_cn from ipv4 where $1 between ip_from and ip_to;",
  values: [ip],
})

export const countryByIpv6Query = (ip: string) => ({
  name: "country-by-ipv6",
  text: "SELECT ip_cn from ipv6 where $1 between ip_from and ip_to;",
  values: [ip],
})

export const userUpdateProfileQuery = ({
  id,
  firstname,
  lastname,
  phone,
  cn,
}: {
  id: number
  firstname: string
  lastname: string
  phone: string
  cn: string
}) => ({
  name: "insert-user-profile",
  text: "UPDATE users SET usr_firstname=$2, usr_lastname=$3, usr_phone=$4, usr_cn=$5 WHERE usr_id=$1 RETURNING *",
  values: [id, firstname, lastname, phone, cn],
})

export const allUsersQuery = () => ({
  name: "all-users",
  text: "SELECT usr_id, usr_firstname, usr_lastname, usr_email, usr_url, role_name as usr_role_name, usr_co, usr_phone, usr_cn FROM users INNER JOIN roles ON usr_role=role_id",
})

export const allCountriesQuery = () => ({
  name: "all-countries",
  text: "SELECT cn_iso, cn_case_name, cn_phonecode, cn_flag FROM country ORDER BY cn_case_name",
})
