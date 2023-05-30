import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import jwt from "jsonwebtoken"
import { generateTokens } from "../services/token.service.js"
import * as userService from "../services/user.service.js"

//-------User Sign Up Function-------------------------------------------------------------------------------

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const err = validationResult(req)
    if (!err.isEmpty()) {
      throw { status: 400, data: "Validation Error: Invalid email or password" }
    }
    const { email, password } = req.body
    const ip = req.ip
    const { user, company, country, tokens } = await userService.signup(email, password, ip)

    res.cookie("rf_tkn", tokens?.refreshToken, {
      maxAge: 2592000000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    res.json({ user, company, country, token: tokens?.accessToken })
  } catch (e) {
    next(e)
  }
}

//-------User Sign In Function--------------------------------------------------------------------------

export async function signin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body

    if (email && password) {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        throw { status: 400, data: "Validation Error: Invalid email or password" }
      }

      const { user, company, country, tokens } = await userService.signin(email, password)

      res.cookie("rf_tkn", tokens?.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      res.json({ user, company, country, token: tokens!.accessToken })
      return
    }
    //----User Auto Sign In By Token--------------------------------------------------------------------
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

    const { user, company, country } = await userService.getUserData(tokenData.id)

    res.json({ user, company, country, token: tokens.accessToken })
  } catch (e) {
    next(e)
  }
}

//---Update Access and Refresh Tockens Function------------------------------------------------------------

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
  } catch (e) {
    next(e)
  }
}

//---User Sign Out Function----------------------------------------------------------

export function signout(req: Request, res: Response, next: NextFunction): void {
  try {
    res.clearCookie("rf_tkn")
    res.end()
  } catch (e) {
    next(e)
  }
}
