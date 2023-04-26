// import { ISchedule } from "../types.js"
import { IFlight } from "../types.js"
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
  text: "SELECT co_id, co_name, co_category, co_iata_code, co_cn FROM company WHERE co_id=$1",
  values: [id],
})

export const getFleetTableNameQuery = (id: number) => ({
  name: "company-fleet-name",
  text: "SELECT co_tb2 FROM company WHERE co_id=$1",
  values: [id],
})

export const getFleetQuery = (table: string) => ({
  name: "fleet",
  text: `SELECT * FROM ${table}`,
})

export const getFlightsTableNameQuery = (id: number) => ({
  name: "company-schedule-name",
  text: "SELECT co_tb FROM company WHERE co_id=$1",
  values: [id],
})
export const getFlightsQuery = (table: string, date: string) => ({
  name: "flights",
  text: `SELECT fl_id as id, TO_CHAR(fl_date,'YYYY-MM-DD') as date, fl_num as flight, fl_ac_iata as "acType", fl_ac_reg as "acReg", fl_from as from, fl_to as to, to_char(fl_std,'HH24:MI') as std, to_char(fl_sta,'HH24:MI') as sta, fl_ac_sts as seats FROM ${table} WHERE fl_date=$1::date ORDER BY fl_from ASC, fl_std ASC`,
  values: [date],
})

export const companyInsertFlightsQuery = (table: string, flights: string) => ({
  name: "insert-flights",
  text: `INSERT INTO ${table} (fl_date, fl_num, fl_ac_iata, fl_ac_reg, fl_from, fl_to, fl_std, fl_sta, fl_ac_sts) VALUES ${flights}`,
})

export const companyUpdateFlightQuery = (table: string, flight: IFlight) => ({
  name: "update-flight",
  text: `UPDATE ${table} SET fl_date=$1::date, fl_num=$2, fl_ac_iata=$3, fl_ac_reg=$4, fl_from=$5, fl_to=$6, fl_std=$7, fl_sta=$8, fl_ac_sts=$9 WHERE fl_id=$10`,
  values: [
    flight.date,
    flight.flight,
    flight.acType,
    flight.acReg,
    flight.from,
    flight.to,
    flight.std,
    flight.std,
    flight.seats,
    flight.id,
  ],
})

export const companyDeleteFlightQuery = (table: string, flight: number) => ({
  name: "delete-flight",
  text: `DELETE FROM ${table} WHERE fl_id=$1`,
  values: [flight],
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
