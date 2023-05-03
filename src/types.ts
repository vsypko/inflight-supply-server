export interface IUser {
  id: number
  usr_firstname: string | undefined
  usr_lastname: string | undefined
  usr_email: string
  usr_url: string | undefined
  usr_role_name: string
  usr_co: number | undefined
  usr_phone: string | undefined
  usr_cn: string | undefined
}

export interface ICompany {
  id: number
  co_name: string
  co_category: string
  co_iata_code: string
  co_cn: string
  co_tb_1: string
  co_tb_2: string
  co_cn_name: string
  co_cn_flag: string
}

export interface IFlight {
  id: number
  date: string
  flight: number
  acType: string
  acReg: string
  from: string
  to: string
  std: number
  sta: number
  seats: number
}

export interface IFleet {
  id: number
  name: string
  acType: string
  acReg: string
  seats: number
}

export interface ICountry {
  cn_iso: string
  cn_case_name: string
  cn_phonecode: number
  cn_flag: string
}

export interface ITokens {
  accessToken: string
  refreshToken: string
}

export interface IUserStateResponse {
  user: IUser | undefined
  company: ICompany | undefined
  country: ICountry | undefined
  tokens: ITokens | undefined
}

// export interface IAuthResponse {
//   user: IUserResponse
//   tokens: ITokens
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
export interface IError {
  status?: number
  data: string
}
