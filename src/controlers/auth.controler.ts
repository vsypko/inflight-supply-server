import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import jwt from "jsonwebtoken"
import { generateTokens } from "../services/token.service.js"
import * as userService from "../services/user.service.js"
import { companyByIdQuery, userByIdQuery } from "../db/queries.js"
import db from "../db/db.js"
import { Company } from "../types.js"

//-------User Sign Up Function-------------------------------------------------------------------------------

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const err = validationResult(req)
    if (!err.isEmpty()) {
      throw { status: 400, data: "Validation Error: Invalid email or password" }
    }
    const { email, password } = req.body
    const ip = req.ip
    const {
      user,
      tokens: { refreshToken, accessToken },
    } = await userService.signup(email, password, ip)

    res.cookie("rf_tkn", refreshToken, {
      maxAge: 2592000000,
      // httpOnly: true,
      sameSite: "lax",
      // secure: true,
    })
    user.token = accessToken
    res.json(user)
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

      const {
        user,
        company,
        tokens: { refreshToken, accessToken },
      } = await userService.signin(email, password)

      res.cookie("rf_tkn", refreshToken, {
        maxAge: 2592000000,
        // httpOnly: true,
        sameSite: "lax",
        // secure: true,
      })
      user.token = accessToken
      res.json({ user, company })
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
    const { refreshToken, accessToken } = generateTokens({ id: tokenData.id, role: tokenData.role })
    res.cookie("rf_tkn", refreshToken, {
      maxAge: 2592000000,
      // httpOnly: true,
      sameSite: "lax",
      // secure: true,
    })
    const userData = await db.query(userByIdQuery(tokenData.id))
    if (userData.rowCount === 0) throw { status: 500, data: "Internal server error.\n Database failure." }
    const user = userData.rows[0]
    user.token = accessToken
    let company = undefined
    if (user.company_id) {
      const data = await db.query(companyByIdQuery(user.company_id))
      company = data.rows[0]
    }
    res.json({ user, company })
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
    const { refreshToken, accessToken } = generateTokens({ id: tokenData.id, role: tokenData.role })

    res.cookie("rf_tkn", refreshToken, {
      maxAge: 2592000000,
      // httpOnly: true,
      sameSite: "lax",
      // secure: true,
    })
    res.json(accessToken)
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
