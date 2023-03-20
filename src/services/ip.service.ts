import { QueryResult } from "pg"
import db from "../db/db.js"
import { countryByIpv4Query, countryByIpv6Query } from "../db/queries.js"

// const check_ip = (ip: string) => {
//   if (ip.includes("::ffff:")) return ip.replace("::ffff:", "")
//   return null
// }

// export const normalizeIPv6 = (ipv6: string): string => {
//   // for embedded IPv4 in IPv6.
//   // like "::ffff:127.0.0.1"
//   ipv6 = ipv6.replace(/\d+\.\d+\.\d+\.\d+$/, (ipv4: string): string => {
//     const [a, b, c, d] = ipv4.split(".")
//     return ((parseInt(a) << 8) | parseInt(b)).toString(16) + ":" + ((parseInt(c) << 8) | parseInt(d)).toString(16)
//   })

//   // shortened IPs
//   // like "2001:db8::1428:57ab"
//   ipv6 = ipv6.replace("::", ":".repeat(10 - ipv6.split(":").length))

//   return ipv6
//     .toLowerCase()
//     .split(":")
//     .map((v) => v.padStart(4, "0"))
//     .join(":")
// }

// export const ip2bigint = (ipv6: string): BigInt => BigInt("0x" + normalizeIPv6(ipv6).replaceAll(":", ""))

// export const ip2ipv4 = (ip: string): string => ip.replace("::ffff:", "")

// export const int2ip = (ipInt: number) =>
//   (ipInt >>> 24) + "." + ((ipInt >> 16) & 255) + "." + ((ipInt >> 8) & 255) + "." + (ipInt & 255)

// export const ip2int = (ip: string): number =>
//   ip.split(".").reduce((ipInt, octet) => {
//     return (ipInt << 8) + parseInt(octet, 10)
//   }, 0) >>> 0

export async function countryByIp(ip: string): Promise<QueryResult | string> {
  if (ip.includes("::ffff:")) {
    ip = ip.replace("::ffff:", "")
  }
  if (ip.includes("127.0.0.1") || (ip.includes("192.168.") && ip.indexOf("192.168.") === 0)) {
    return "ZZ"
  }
  if (ip.includes(".")) {
    const cn = await db.query(countryByIpv4Query(ip))
    if (cn.rowCount != 0) return cn.rows[0].ip_cn
  }
  const cn = await db.query(countryByIpv6Query(ip))
  if (cn.rowCount != 0) return cn.rows[0].ip_cn
  return "ZZ"
}

//   return ip.replace("::ffff:", "")
// return null
// if (check_ip(ip)) {
//   ip = check_ip(ip)
//   cn = await db.query
// } else {
//   console.log("cn from ipv6")
// }

// })
