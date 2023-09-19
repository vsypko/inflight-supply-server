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

export interface ICompany {
  id: number
  category: string
  name: string
  reg_number: string
  icao?: string
  iata?: string
  country: {
    iso: string
    title_case: string
    phonecode: number
    currency: string
    flag: string
  }
  city: string
  address: string
  link?: string
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
  co_id: number
  co_iata: string
}

export interface IFleet {
  id: number
  name: string
  acType: string
  acReg: string
  seats: number
}

export interface ISchedule {
  departure?: string
  arrival?: string
  destination: string
  flight: string
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
  id: number
  type_ap: string
  name: string
  latitude: number
  longitude: number
  elevation_ft: number
  continent: string
  country_name: string
  country: string
  iso_region: string
  municipality: string
  scheduled: string
  icao: string | null
  iata: string | null
  home_link: string | null
}
export interface IAirportResponse {
  total_count: number
  airports: IAirport[]
}
export interface IError {
  status?: number
  data: string
}
