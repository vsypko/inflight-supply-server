import { QueryResult } from "pg"
import db from "../db/db.js"
import { countryByIpv4Query, countryByIpv6Query } from "../db/queries.js"

export async function countryByIp(ip: string): Promise<QueryResult | string> {
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
