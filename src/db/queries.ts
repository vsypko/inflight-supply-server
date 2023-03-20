export const userEmailCheckQuery = (email: string) => ({
  name: "email-check",
  text: "SELECT * FROM users WHERE usr_email = $1",
  values: [email],
})

export const userInsertQuery = (email: string, password: string, role: number) => ({
  name: "insert-user",
  text: "INSERT INTO users (usr_email, usr_password, usr_role) values ($1, $2, $3) RETURNING *",
  values: [email, password, role],
})

export const userByIdQuery = (id: number) => ({
  name: "user-by-id",
  text: "SELECT usr_id, usr_firstname, usr_lastname, usr_email, role_name, usr_photourl, usr_phone, co_name, cn_phonecode, cn_flag FROM users INNER JOIN roles ON usr_role=role_id INNER JOIN company ON usr_co=co_id INNER JOIN country ON co_iso_country=cn_iso WHERE usr_id=$1;",
  values: [id],
})

export const airportQuery = (search: string) => ({
  name: "airport",
  text: "SELECT ap_id, ap_type, ap_name, ap_latitude, ap_longitude, ap_elevation_ft, ap_continent, ap_country, ap_iso_country, ap_iso_region, ap_municipality, ap_scheduled, ap_icao_code, ap_iata_code, ap_home_link FROM airports WHERE ts_ap @@ to_tsquery($1) order by ap_name",
  values: [search],
})
export const allUsersQuery = () => ({
  name: "all-users",
  text: "SELECT * FROM users",
})

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
