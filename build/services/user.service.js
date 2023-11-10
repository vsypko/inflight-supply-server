import db from "../db/db.js";
import bcrypt from "bcrypt";
import { companyByIdQuery, countryByIpQuery, userByIdQuery, userEmailCheckQuery, userInsertQuery, } from "../db/queries.js";
import { generateTokens } from "./token.service.js";
export async function signup(email, password, ip) {
    const checkEmail = await db.query(userEmailCheckQuery(email));
    if (checkEmail.rowCount != 0)
        throw { status: 400, data: "Such user already exists" };
    const hashedPassword = await bcrypt.hash(password, 3);
    const country_iso = await countryByIpQuery(ip);
    const newUser = await db.query(userInsertQuery(email, hashedPassword, country_iso));
    if (newUser.rowCount === 0)
        throw { status: 500, data: "Internal server error" };
    const data = await db.query(userByIdQuery(newUser.rows[0].id));
    const user = data.rows[0];
    const tokens = generateTokens({ id: user.id, role: user.role });
    return {
        user,
        tokens,
    };
}
export async function signin(email, password) {
    const checkUser = await db.query(userEmailCheckQuery(email));
    if (checkUser.rowCount === 0)
        throw { status: 400, data: "Such user not found!\n Please sign up" };
    const checkPassword = await bcrypt.compare(password, checkUser.rows[0].password);
    if (!checkPassword)
        throw { status: 400, data: "Incorrect password" };
    const data = await db.query(userByIdQuery(checkUser.rows[0].id));
    const user = data.rows[0];
    const tokens = generateTokens({ id: user.id, role: user.role });
    let company = undefined;
    if (user.company_id) {
        const data = await db.query(companyByIdQuery(user.company_id));
        company = data.rows[0];
    }
    return {
        user,
        company,
        tokens,
    };
}
//# sourceMappingURL=user.service.js.map