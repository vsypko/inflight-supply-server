import db from "../db/db.js";
import { getDataFlightsQuery, insertFlightsQuery, deleteDataQuery, updateFlightQuery, getDataQuery, getDataFleetQuery, insertFleetQuery, updateFleetQuery, } from "../db/queries.js";
export async function getData(req, res, next) {
    try {
        if (!req.params || !req.query)
            throw { status: 400, data: "Bad request" };
        if (req.params.tb_type === "flights") {
            const table = req.query.tb.toString();
            const date = req.query.date.toString();
            const result = await db.query(getDataFlightsQuery(table, date));
            res.json(result.rows);
            return;
        }
        if (req.params.tb_type === "fleet") {
            const table = req.query.tb.toString();
            const result = await db.query(getDataFleetQuery(table));
            res.json(result.rows);
            return;
        }
        const table = req.query.tb.toString();
        const result = await db.query(getDataQuery(table));
        res.json(result.rows);
    }
    catch (e) {
        next(e);
    }
}
export async function insertData(req, res, next) {
    try {
        if (!req.params || !req.query)
            throw { status: 400, data: "Bad request" };
        const table = req.body.tb.toString();
        const data = req.body.values;
        if (!data)
            throw { status: 400, data: "Bad request. File data failure." };
        let result;
        if (req.params.tb_type === "flights") {
            result = await db.query(insertFlightsQuery(table, data));
            res.json({ data: `Inserted ${result.rowCount} rows` });
            return;
        }
        if (req.params.tb_type === "fleet") {
            result = await db.query(insertFleetQuery(table, data));
            res.json({ data: `Inserted ${result.rowCount} rows` });
            return;
        }
        res.json({ data: "No data found" });
    }
    catch (e) {
        next(e);
    }
}
export async function updateData(req, res, next) {
    if (!req.params || !req.query)
        throw { status: 400, data: "Bad request" };
    try {
        const table = req.body.tb.toString();
        const data = req.body.value;
        if (req.params.tb_type === "flight") {
            await db.query(updateFlightQuery(table, data));
            res.json({ data: "Flight has been updated" });
            return;
        }
        if (req.params.tb_type === "fleet") {
            await db.query(updateFleetQuery(table, data));
            res.json({ data: "Aircraft has been updated" });
            return;
        }
        res.json({ data: "No data found" });
    }
    catch (e) {
        next(e);
    }
}
export async function deleteData(req, res, next) {
    if (!req.params || !req.query)
        throw { status: 400, data: "Bad request" };
    try {
        const table = req.query.tb.toString();
        const id = Number(req.query.id);
        await db.query(deleteDataQuery(table, id));
        res.json({ data: "Data row has been deleted" });
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=company.controler.js.map