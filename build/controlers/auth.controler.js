import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { generateTokens } from "../services/token.service.js";
import * as userService from "../services/user.service.js";
import { userByIdQuery } from "../db/queries.js";
import db from "../db/db.js";
export async function signup(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            throw { status: 400, data: "Validation Error: Invalid email or password" };
        }
        const { email, password } = req.body;
        const ip = req.ip;
        const { user, tokens: { refreshToken, accessToken }, } = await userService.signup(email, password, ip);
        res.cookie("rf_tkn", refreshToken, {
            maxAge: 2592000000,
            sameSite: "lax",
        });
        user.token = accessToken;
        res.json(user);
    }
    catch (e) {
        next(e);
    }
}
export async function signin(req, res, next) {
    try {
        const { email, password } = req.body;
        if (email && password) {
            const err = validationResult(req);
            if (!err.isEmpty()) {
                throw { status: 400, data: "Validation Error: Invalid email or password" };
            }
            const { user, tokens: { refreshToken, accessToken }, } = await userService.signin(email, password);
            res.cookie("rf_tkn", refreshToken, {
                maxAge: 2592000000,
                sameSite: "lax",
            });
            user.token = accessToken;
            res.json(user);
            return;
        }
        const { rf_tkn: updateToken } = req.cookies;
        if (!updateToken)
            throw { status: 401, data: "Unauthorized request" };
        const tokenData = jwt.verify(updateToken, process.env.JWT_REFRESH_SECRET);
        if (!tokenData)
            throw { status: 401, data: "Unauthorized request" };
        const { refreshToken, accessToken } = generateTokens({ id: tokenData.id, role: tokenData.role });
        res.cookie("rf_tkn", refreshToken, {
            maxAge: 2592000000,
            sameSite: "lax",
        });
        const userData = await db.query(userByIdQuery(tokenData.id));
        if (userData.rowCount === 0)
            throw { status: 500, data: "Internal server error.\n Database failure." };
        const user = userData.rows[0];
        user.token = accessToken;
        res.json(user);
    }
    catch (e) {
        next(e);
    }
}
export function tokenUpdate(req, res, next) {
    try {
        const { rf_tkn: updateToken } = req.cookies;
        if (!updateToken)
            throw { status: 401, data: "Unauthorized request" };
        const tokenData = jwt.verify(updateToken, process.env.JWT_REFRESH_SECRET);
        if (!tokenData)
            throw { status: 401, data: "Unauthorized request" };
        const { refreshToken, accessToken } = generateTokens({ id: tokenData.id, role: tokenData.role });
        res.cookie("rf_tkn", refreshToken, {
            maxAge: 2592000000,
            sameSite: "lax",
        });
        res.json(accessToken);
    }
    catch (e) {
        next(e);
    }
}
export function signout(req, res, next) {
    try {
        res.clearCookie("rf_tkn");
        res.end();
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=auth.controler.js.map