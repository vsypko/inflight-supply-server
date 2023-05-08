import db from "../db/db.js";
import { userRemoveUrlQuery, userInsertUrlQuery, userUpdateProfileQuery, countryByISOQuery, countryByIpQuery, } from "../db/queries.js";
import * as fs from "fs";
export async function saveUserPhoto(req, res, next) {
    try {
        const file = req.file;
        if (!file)
            throw { status: 400, data: "Bad request. File upload failure." };
        const id = req.body.id;
        const newUrl = req.body.newUrl;
        if (!id || !newUrl)
            throw { status: 400, data: "Bad request. User data failure." };
        if (newUrl)
            await db.query(userInsertUrlQuery(id, file.originalname));
        res.json({ data: "Image uploaded" });
    }
    catch (e) {
        next(e);
    }
}
export async function getUserPhoto(req, res, next) {
    try {
        if (!fs.existsSync(`uploads/uph/${req.params.url}`))
            throw { status: 400, data: "Bad request. File load failure." };
        const image = fs.readFileSync(`uploads/uph/${req.params.url}`);
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Encoding", "binary");
        res.send(image);
    }
    catch (e) {
        next(e);
    }
}
export async function removeUserPhoto(req, res, next) {
    try {
        await db.query(userRemoveUrlQuery(req.params.url));
        fs.unlinkSync(`uploads/uph/${req.params.url}`);
        res.json({ data: "Photo deleted successfully" });
    }
    catch (e) {
        next(e);
    }
}
export async function updateUserProfile(req, res, next) {
    try {
        if (!req.body)
            throw { status: 400, data: "Bad request. Incorrect data." };
        const userRows = await db.query(userUpdateProfileQuery(req.body));
        if (userRows.rowCount === 0)
            throw { status: 500, data: "Internal server error.\n Database failure." };
        const user = userRows.rows[0];
        let country_iso = user.usr_cn;
        const ip = "89.144.220.16";
        if (country_iso === "ZZ")
            country_iso = await countryByIpQuery(ip);
        const countryData = await db.query(countryByISOQuery(country_iso));
        if (countryData.rowCount === 0)
            throw { status: 500, data: "Internal server error.\n Database failure." };
        const country = countryData.rows[0];
        res.json({
            firstname: user.usr_firstname,
            lastname: user.usr_lastname,
            phone: user.usr_phone,
            cn: user.usr_cn,
            country,
        });
    }
    catch (e) {
        next(e);
    }
}
export async function removeUserProfileData(req, res, next) { }
//# sourceMappingURL=user.controler.js.map