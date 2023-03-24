import db from "../db/db.js";
import { airportQuery, allUsersQuery } from "../db/queries.js";
export async function getAirport(req, res, next) {
    try {
        const airports = await db.query(airportQuery(`${req.query.q}:*`));
        if (airports)
            res.send({ total_count: airports.rowCount, airports: airports.rows });
    }
    catch (e) {
        next(e);
    }
}
export async function getAllUsers(req, res, next) {
    try {
        const users = await db.query(allUsersQuery());
        if (users)
            res.send({ total_count: users.rowCount, users: users.rows });
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=search.controler.js.map