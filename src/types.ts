export interface IUser {
  id: number
  firstname: string | undefined
  lastname: string | undefined
  email: string
  img_url: string | undefined
  role: string
  company: number | undefined
  phone: string | undefined
  country: string
}

// export interface ICompany {
//   id: number
//   name: string
//   category: string
//   iata: string
//   table1: string
//   table2: string
//   country: string
// }

export interface ICompany {
  id: number
  name: string
  category: string
  iata: string
  table1: string
  table2: string
  country: ICountry
}

export interface ICountry {
  iso: string
  title_case: string
  phonecode: number
  currency: string
  flag: string
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
