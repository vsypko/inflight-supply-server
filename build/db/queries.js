export const userEmailCheckQuery = (email) => ({
    name: "email-check",
    text: "SELECT usr_id, usr_password, usr_role FROM users WHERE usr_email=$1",
    values: [email],
});
export const userInsertQuery = (email, password, uniqueURL) => ({
    name: "insert-user",
    text: "INSERT INTO users (usr_email, usr_password, usr_url) values ($1, $2) RETURNING *",
    values: [email, password],
});
export const userByIdQuery = (id) => ({
    name: "user-by-id",
    text: "SELECT usr_id, usr_firstname, usr_lastname, usr_email, usr_url, role_name as usr_role_name, usr_co, usr_phone, usr_cn FROM users INNER JOIN roles ON usr_role=role_id WHERE usr_id=$1",
    values: [id],
});
export const companyByIdQuery = (id) => ({
    name: "country-by-id",
    text: "SELECT co_name, co_country_iso FROM company WHERE co_id=$1",
    values: [id],
});
export const countryByISOQuery = (country_iso) => ({
    name: "country-by-iso",
    text: "SELECT cn_case_name, cn_phonecode, cn_flag FROM country WHERE cn_iso=$1",
    values: [country_iso],
});
export const airportQuery = (search) => ({
    name: "airport",
    text: "SELECT ap_id, ap_type, ap_name, ap_latitude, ap_longitude, ap_elevation_ft, ap_continent, ap_country, ap_iso_country, ap_iso_region, ap_municipality, ap_scheduled, ap_icao_code, ap_iata_code, ap_home_link FROM airports WHERE ts_ap @@ to_tsquery($1) order by ap_name",
    values: [search],
});
export const allUsersQuery = () => ({
    name: "all-users",
    text: "SELECT * FROM users",
});
export const countryByIpv4Query = (ip) => ({
    name: "country-by-ipv4",
    text: "SELECT ip_cn from ipv4 where $1 between ip_from and ip_to;",
    values: [ip],
});
export const countryByIpv6Query = (ip) => ({
    name: "country-by-ipv6",
    text: "SELECT ip_cn from ipv6 where $1 between ip_from and ip_to;",
    values: [ip],
});
//# sourceMappingURL=queries.js.map