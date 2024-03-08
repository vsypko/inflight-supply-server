export interface User {
  id: number
  firstname: string
  lastname: string
  email: string
  img_url: string
  role: string
  phone: string
  img_url_data: string
  country_iso: string
  country: string
  phonecode: number
  flag: string
  company_id: number
  token: string
}

export interface Company {
  id: number
  category: string
  name: string
  reg_number: string
  icao?: string
  iata?: string
  country_iso: string
  city: string
  address: string
  link?: string
}

export interface Country {
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
  type: string
  reg: string
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
  type: string
  reg: string
  seats: number
  crew: number
  fc: number
  bc: number
  yc: number
  co_id: number
}

export interface ISupply {
  id: number
  code: number
  title: string
  category: string
  area: string
  description: string
  img_url: string
  price: number
  co_id: number
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

// export interface IUserStateResponse {
//   user: User | undefined
//   company: Company | undefined
//   country: ICountry | undefined
//   tokens: ITokens | undefined
// }

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

export interface IContract {
  id: number
  signed_at: string
  airline: number
  supplier: number
  airport: number
  airline_signatory: number
  supplier_signatory: number
  name: string
  reg_number: string
  iata: string
  country_iso: string
}

export interface IOrderedSupply {
  item_id: number
  item_price: number
  item_qty: number
  item_section: string
}
