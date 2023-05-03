// import { ISchedule } from "../types.js"
import { IFlight, IFleet } from "../types.js"
import db from "./db.js"

export const airportQuery = (search: string) => ({
  name: "airport",
  text: "SELECT ap_id, ap_type, ap_name, ap_latitude, ap_longitude, ap_elevation_ft, ap_continent, ap_country, ap_iso_country, ap_iso_region, ap_municipality, ap_scheduled, ap_icao_code, ap_iata_code, ap_home_link FROM airports WHERE ts_ap @@ to_tsquery($1) order by ap_name",
  values: [search],
})

export const userEmailCheckQuery = (email: string) => ({
  name: "email-check",
  text: "SELECT id, usr_password, usr_role FROM users WHERE usr_email=$1",
  values: [email],
})

export const userInsertQuery = (email: string, password: string) => ({
  name: "insert-user",
  text: "INSERT INTO users (usr_email, usr_password) values ($1, $2) RETURNING *",
  values: [email, password],
})

export const userInsertUrlQuery = (id: string, url: string) => ({
  name: "insert-user-url",
  text: "UPDATE users SET usr_url=$2 WHERE id=$1",
  values: [id, url],
})

export const userRemoveUrlQuery = (url: string) => ({
  name: "delete-user-url",
  text: "UPDATE users SET usr_url='' WHERE usr_url=$1",
  values: [url],
})

export const userByIdQuery = (id: number) => ({
  name: "user-by-id",
  text: "SELECT id, usr_firstname, usr_lastname, usr_email, usr_url, role_name as usr_role_name, usr_co, usr_phone, usr_cn FROM users INNER JOIN roles ON usr_role=role_id WHERE id=$1",
  values: [id],
})

export const companyByIdQuery = (id: number) => ({
  name: "country-by-id",
  text: "SELECT id, co_name, co_category, co_iata_code, co_cn, co_tb_1, co_tb_2 FROM company WHERE id=$1",
  values: [id],
})

export const getDataQuery = (table: string) => ({
  name: "table",
  text: `SELECT * FROM ${table}`,
})

export const getDataFleetQuery = (table: string) => ({
  name: "table",
  text: `SELECT id, ac_name as "name", ac_type as "acType", ac_reg as "acReg", ac_seats as "seats" FROM ${table}`,
})

export const getDataFlightsQuery = (table: string, date: string) => ({
  name: "flights",
  text: `SELECT id, TO_CHAR(fl_date,'YYYY-MM-DD') as date, fl_num as flight, fl_ac_iata as "acType", fl_ac_reg as "acReg", fl_from as from, fl_to as to, to_char(fl_std,'HH24:MI') as std, to_char(fl_sta,'HH24:MI') as sta, fl_ac_seats as seats FROM ${table} WHERE fl_date=$1::date ORDER BY fl_from ASC, fl_std ASC`,
  values: [date],
})

export const insertFleetQuery = (table: string, fleet: string) => ({
  name: "insert-fleet",
  text: `INSERT INTO ${table} (ac_name, ac_type, ac_reg, ac_seats) VALUES ${fleet}`,
})

export const insertFlightsQuery = (table: string, flights: string) => ({
  name: "insert-flights",
  text: `INSERT INTO ${table} (fl_date, fl_num, fl_ac_iata, fl_ac_reg, fl_from, fl_to, fl_std, fl_sta, fl_ac_seats) VALUES ${flights}`,
})

export const updateFleetQuery = (table: string, fleet: IFleet) => ({
  name: "update-fleet",
  text: `UPDATE ${table} SET ac_name=$2, ac_type=$3, ac_reg=$4, ac_seats=$5 WHERE id=$1`,
  values: Object.values(fleet),
})

export const updateFlightQuery = (table: string, flight: IFlight) => ({
  name: "update-flight",
  text: `UPDATE ${table} SET fl_date=$2::date, fl_num=$3, fl_ac_iata=$4, fl_ac_reg=$5, fl_from=$6, fl_to=$7, fl_std=$8, fl_sta=$9, fl_ac_seats=$10 WHERE id=$1`,
  values: Object.values(flight),
})

export const deleteDataQuery = (table: string, id: number) => ({
  name: "delete-data",
  text: `DELETE FROM ${table} WHERE id=$1`,
  values: [id],
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
  cn,
}: {
  id: number
  firstname: string
  lastname: string
  phone: string
  cn: string
}) => ({
  name: "insert-user-profile",
  text: "UPDATE users SET usr_firstname=$2, usr_lastname=$3, usr_phone=$4, usr_cn=$5 WHERE id=$1 RETURNING *",
  values: [id, firstname, lastname, phone, cn],
})

export const allUsersQuery = () => ({
  name: "all-users",
  text: "SELECT id, usr_firstname, usr_lastname, usr_email, usr_url, role_name as usr_role_name, usr_co, usr_phone, usr_cn FROM users INNER JOIN roles ON usr_role=role_id",
})

export const allCountriesQuery = () => ({
  name: "all-countries",
  text: "SELECT cn_iso, cn_case_name, cn_phonecode, cn_flag FROM country ORDER BY cn_case_name",
})
