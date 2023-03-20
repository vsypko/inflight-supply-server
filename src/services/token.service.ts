import jwt from "jsonwebtoken"

let accessToken: string
let refreshToken: string

export const generateTokens = (payload: string | jwt.JwtPayload) => {
  accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as jwt.Secret, {
    expiresIn: "10s",
  })

  refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as jwt.Secret, {
    expiresIn: "30d",
  })
  return {
    accessToken,
    refreshToken,
  }
}
