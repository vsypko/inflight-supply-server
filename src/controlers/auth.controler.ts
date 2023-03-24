import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import jwt from "jsonwebtoken"
import { generateTokens } from "../services/token.service.js"
import * as userService from "../services/user.service.js"
import { countryByIp } from "../services/ip.service.js"

//----------------------------------------------------------------------------------------------------------------------------------

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const err = validationResult(req)
    if (!err.isEmpty()) {
      throw { status: 400, data: "Validation Error: Invalid email or password" }
    }
    const { email, password } = req.body
    const ip = req.ip
    const country_iso = await countryByIp(ip)

    const { user, company, country, tokens } = await userService.signup(email, password, country_iso as string)

    res.cookie("rf_tkn", tokens?.refreshToken, {
      maxAge: 2592000000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    res.json({ user, company, country, token: tokens?.accessToken })
    next()
  } catch (e) {
    next(e)
  }
}

//-------------------------------------------------------------------------------------------------------------------------------------

export async function signin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body

    const ip = req.ip
    // const country_iso = await countryByIp("45.138.10.61")
    const country_iso = await countryByIp("93.72.42.167")

    if (email && password) {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        throw { status: 400, data: "Validation Error: Invalid email or password" }
      }

      const { user, company, country, tokens } = await userService.signin(email, password, country_iso as string)

      res.cookie("rf_tkn", tokens?.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      res.json({ user, company, country, token: tokens!.accessToken })
      return
    }
    //----//-------------------//-----//----------------------------------------------------------------------------
    const { rf_tkn: updateToken } = req.cookies
    if (!updateToken) throw { status: 401, data: "Unauthorized request" }
    const tokenData = jwt.verify(updateToken, process.env.JWT_REFRESH_SECRET as jwt.Secret) as {
      id: number
      role: number
    }
    if (!tokenData) throw { status: 401, data: "Unauthorized request" }
    const tokens = generateTokens({ id: tokenData.id, role: tokenData.role })

    res.cookie("rf_tkn", tokens.refreshToken, {
      maxAge: 2592000000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })

    const { user, company, country } = await userService.getUserData(tokenData.id, country_iso as string)

    res.json({ user, company, country, token: tokens.accessToken })
    next()
  } catch (e) {
    next(e)
  }
}

//---------------------------------------------------------------------------------------------------------------------

export function tokenUpdate(req: Request, res: Response, next: NextFunction): void {
  try {
    const { rf_tkn: updateToken } = req.cookies
    if (!updateToken) throw { status: 401, data: "Unauthorized request" }

    const tokenData = jwt.verify(updateToken, process.env.JWT_REFRESH_SECRET as jwt.Secret) as {
      id: number
      role: number
    }
    if (!tokenData) throw { status: 401, data: "Unauthorized request" }
    const tokens = generateTokens({ id: tokenData.id, role: tokenData.role })

    res.cookie("rf_tkn", tokens.refreshToken, {
      maxAge: 2592000000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    res.json(tokens.accessToken)
    next()
  } catch (e) {
    next(e)
  }
}

//--------------------------------------------------------------------------------------------------------------------

export function signout(req: Request, res: Response, next: NextFunction): void {
  try {
    res.clearCookie("rf_tkn")
    next()
  } catch (e) {
    next(e)
  }
}
