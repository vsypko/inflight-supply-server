import db from "../db/db.js";
import { airportByCodeQuery, allCountriesQuery, allUsersQuery, scheduleFromQuery, scheduleToQuery, airportSearchQuery, } from "../db/queries.js";
export async function getAirport(req, res, next) {
    try {
        const airports = await db.query(airportSearchQuery(`${req.query.q}:*`));
        if (airports)
            res.send({ total_count: airports.rowCount, airports: airports.rows });
    }
    catch (e) {
        next(e);
    }
}
export async function getAirportbyCode(req, res, next) {
    try {
        const airports = await db.query(airportByCodeQuery(req.query.q));
        if (airports)
            res.send({ total_count: airports.rowCount, airports: airports.rows });
    }
    catch (e) {
        next(e);
    }
}
export async function getAllUsers(req, res, next) {
    try {
        const { column, value } = req.query;
        const users = await db.query(allUsersQuery(column, Number(value)));
        if (users)
            res.send({ total_count: users.rowCount, users: users.rows });
    }
    catch (e) {
        next(e);
    }
}
export async function getAllCountries(req, res, next) {
    try {
        const countries = await db.query(allCountriesQuery());
        if (countries)
            res.json(countries.rows);
    }
    catch (e) {
        next(e);
    }
}
export async function getSchedule(req, res, next) {
    var _a, _b;
    try {
        const airport = (_a = req.query.airport) === null || _a === void 0 ? void 0 : _a.toString();
        const date = (_b = req.query.date) === null || _b === void 0 ? void 0 : _b.toString();
        if (!airport || !date)
            throw { status: 400, data: "Bad request. No params found." };
        const scheduleFrom = await db.query(scheduleFromQuery(airport, date));
        const scheduleTo = await db.query(scheduleToQuery(airport, date));
        const schedule = { scheduleFrom: [], scheduleTo: [] };
        if (scheduleFrom)
            schedule.scheduleFrom = scheduleFrom.rows;
        if (scheduleTo)
            schedule.scheduleTo = scheduleTo.rows;
        res.send(schedule);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=search.controler.js.map