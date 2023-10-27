import db from "../db/db.js";
import { userRemoveUrlQuery, userInsertUrlQuery, userUpdateProfileQuery, userGetUrlQuery, userByIdQuery, } from "../db/queries.js";
import * as fs from "fs";
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
export async function saveUserPhoto(req, res, next) {
    try {
        const id = req.body.id;
        if (!id)
            throw { status: 400, data: "Bad request. User data failure." };
        const url = await db.query(userGetUrlQuery(id));
        const oldUrl = url.rows[0].usr_url;
        if (oldUrl)
            fs.unlinkSync(`uploads/uph/${oldUrl}`);
        const file = req.file;
        if (!file)
            throw { status: 400, data: "Bad request. File upload failure." };
        await db.query(userInsertUrlQuery(id, file.originalname));
        res.json({ data: "Image uploaded" });
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
    let userData;
    let country;
    try {
        if (!req.body)
            throw { status: 400, data: "Bad request. Incorrect data." };
        const userData = await db.query(userUpdateProfileQuery(req.body));
        if (userData.rowCount === 0)
            throw { status: 500, data: "Internal server error.\n Database failure." };
        const user = await db.query(userByIdQuery(userData.rows[0].id));
        res.json(user);
    }
    catch (e) {
        next(e);
    }
}
export async function removeUserProfile(req, res, next) { }
function getUserById() { }
//# sourceMappingURL=user.controler.js.map