export interface IUser {
  usr_id: number
  usr_firstname: string | undefined
  usr_lastname: string | undefined
  usr_email: string
  role_name: string
  usr_photourl: string | undefined
  usr_phone: string | undefined
  co_name: string | undefined
  cn_phonecode: number
  cn_flag: string | undefined
}

export interface ITokens {
  accessToken: string
  refreshToken: string
}

export interface IUserResponse {
  user: IUser
  tokens: ITokens
}

// export interface IUsersResponse {
//   total_count: number
//   airports: IUserResponse[]
// }

export interface IAirport {
  ap_id: number
  ap_type: string
  ap_name: string
  ap_latitude: number
  ap_longitude: number
  ap_elevation_ft: number
  ap_continent: string
  ap_country: string
  ap_iso_country: string
  ap_iso_region: string
  ap_municipality: string
  ap_scheduled: string
  ap_icao_code: string | null
  ap_iata_code: string | null
  ap_home_link: string | null
}
export interface IAirportResponse {
  total_count: number
  airports: IAirport[]
}
