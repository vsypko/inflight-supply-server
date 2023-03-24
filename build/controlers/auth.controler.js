import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { generateTokens } from "../services/token.service.js";
import * as userService from "../services/user.service.js";
import { countryByIp } from "../services/ip.service.js";
export async function signup(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            throw { status: 400, data: "Validation Error: Invalid email or password" };
        }
        const { email, password } = req.body;
        const ip = req.ip;
        const country_iso = await countryByIp(ip);
        const { user, company, country, tokens } = await userService.signup(email, password, country_iso);
        res.cookie("rf_tkn", tokens === null || tokens === void 0 ? void 0 : tokens.refreshToken, {
            maxAge: 2592000000,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        res.json({ user, company, country, token: tokens === null || tokens === void 0 ? void 0 : tokens.accessToken });
        next();
    }
    catch (e) {
        next(e);
    }
}
export async function signin(req, res, next) {
    try {
        const { email, password } = req.body;
        const ip = req.ip;
        const country_iso = await countryByIp("93.72.42.167");
        if (email && password) {
            const err = validationResult(req);
            if (!err.isEmpty()) {
                throw { status: 400, data: "Validation Error: Invalid email or password" };
            }
            const { user, company, country, tokens } = await userService.signin(email, password, country_iso);
            res.cookie("rf_tkn", tokens === null || tokens === void 0 ? void 0 : tokens.refreshToken, {
                maxAge: 2592000000,
                httpOnly: true,
                sameSite: "none",
                secure: true,
            });
            res.json({ user, company, country, token: tokens === null || tokens === void 0 ? void 0 : tokens.accessToken });
            next();
        }
        const { rf_tkn: updateToken } = req.cookies;
        if (!updateToken)
            throw { status: 401, data: "Unauthorized request" };
        const tokenData = jwt.verify(updateToken, process.env.JWT_REFRESH_SECRET);
        if (!tokenData)
            throw { status: 401, data: "Unauthorized request" };
        const tokens = generateTokens({ id: tokenData.id, role: tokenData.role });
        res.cookie("rf_tkn", tokens.refreshToken, {
            maxAge: 2592000000,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        const { user, company, country } = await userService.getUserState(tokenData.id, country_iso);
        res.json({ user, company, country, token: tokens.accessToken });
        next();
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
        const tokens = generateTokens({ id: tokenData.id, role: tokenData.role });
        res.cookie("rf_tkn", tokens.refreshToken, {
            maxAge: 2592000000,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        res.json(tokens.accessToken);
        next();
    }
    catch (e) {
        next(e);
    }
}
export function signout(req, res, next) {
    try {
        res.clearCookie("rf_tkn");
        next();
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=auth.controler.js.map