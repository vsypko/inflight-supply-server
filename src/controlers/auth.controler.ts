import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { generateTokens } from '../services/token.service.js'
import * as userService from '../services/user.service.js'
import db from '../db/db.js'

//-------User Sign Up Function-------------------------------------------------------------------------------

export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const err = validationResult(req)
    if (!err.isEmpty()) {
      throw { status: 400, data: 'Validation Error: Invalid email or password' }
    }
    const { email, password } = req.body
    const ip = req.ip
    const {
      user,
      tokens: { refreshToken, accessToken },
    } = await userService.signup(email, password, ip)

    res.cookie('rf_tkn', refreshToken, {
      maxAge: 2592000000,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    })
    user.token = accessToken
    res.json({ user })
  } catch (e) {
    next(e)
  }
}

//-------User Sign In Function--------------------------------------------------------------------------

export async function signin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body

    if (email && password) {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        throw {
          status: 400,
          data: 'Validation Error: Invalid email or password',
        }
      }

      const {
        user,
        company,
        tokens: { refreshToken, accessToken },
      } = await userService.signin(email, password)

      res.cookie('rf_tkn', refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
      })

      user.token = accessToken
      res.json({ user, company })

      return
    }

    //----User Auto Sign In By Token--------------------------------------------------------------------

    const { rf_tkn: updateToken } = req.cookies

    if (!updateToken) throw { status: 401, data: 'Unauthorized request' }

    const tokenData = jwt.verify(
      updateToken,
      process.env.JWT_REFRESH_SECRET as jwt.Secret
    ) as {
      id: number
      role: number
    }

    if (!tokenData) throw { status: 401, data: 'Unauthorized request' }

    const { refreshToken, accessToken } = generateTokens({
      id: tokenData.id,
      role: tokenData.role,
    })

    res.cookie('rf_tkn', refreshToken, {
      maxAge: 2592000000,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    })

    const resultUser = await db.query(
      'SELECT u.id, u.firstname, u.lastname, u.email, u.img_url, r.role_name role, u.company_id, u.phone, u.country_iso, c.title_case country, c.phonecode, c.flag FROM users u INNER JOIN roles r ON role=role_id INNER JOIN countries c ON country_iso=iso WHERE u.id=$1',
      [tokenData.id]
    )

    if (resultUser.rowCount === 0)
      throw { status: 500, data: 'Internal server error.\n Database failure.' }

    const user = resultUser.rows[0]
    user.token = accessToken
    let company = undefined

    if (user.company_id) {
      const result = await db.query(
        'SELECT co.id, co.category, co.name, co.reg_number, co.icao, co.iata, co.country_iso, cn.title_case country, co.city, co.address, co.link, cn.currency, cn.flag FROM companies co INNER JOIN countries cn ON country_iso=iso WHERE co.id=$1',
        [user.company_id]
      )
      company = result.rows[0]
    }

    res.json({ user, company })
  } catch (e) {
    next(e)
  }
}

//---Update Access and Refresh Tockens Function------------------------------------------------------------

export function tokenUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const { rf_tkn: updateToken } = req.cookies

    if (!updateToken) throw { status: 401, data: 'Unauthorized request' }

    const tokenData = jwt.verify(
      updateToken,
      process.env.JWT_REFRESH_SECRET as jwt.Secret
    ) as {
      id: number
      role: number
    }

    if (!tokenData) throw { status: 401, data: 'Unauthorized request' }

    const { refreshToken, accessToken } = generateTokens({
      id: tokenData.id,
      role: tokenData.role,
    })

    res.cookie('rf_tkn', refreshToken, {
      maxAge: 2592000000,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    })

    res.json(accessToken)
  } catch (e) {
    next(e)
  }
}

//---User Sign Out Function----------------------------------------------------------

export function signout(req: Request, res: Response, next: NextFunction): void {
  try {
    res.clearCookie('rf_tkn')
    res.end()
  } catch (e) {
    next(e)
  }
}
