import { Request, Response, NextFunction } from "express"
import db from "../db/db.js"
import { IContract } from "../types.js"

export async function createContract(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body) throw { staus: 400, data: "Bad request" }
    const { airport, airline, supplier, airline_signatory } = req.body
    const createdContract = await db.query(
      "INSERT INTO contracts (airport, airline, supplier, airline_signatory) VALUES($1, $2, $3, $4) RETURNING *",
      [airport, airline, supplier, airline_signatory],
    )
    if (!createdContract.rowCount) throw { staus: 400, data: "Bad request" }
    res.send({ data: "Contract created" })
  } catch (e) {
    next(e)
  }
}

export async function getContract(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.query) throw { status: 400, data: "Bad request" }
    const { ap, co, cat } = req.query
    let result: any
    if (cat === "airline") {
      result = await db.query("SELECT * FROM contracts WHERE airport=$1 AND airline=$2", [ap, co])
    } else {
      result = await db.query("SELECT * FROM contracts WHERE airport=$1 AND supplier=$2", [ap, co])
    }
    const contracts: IContract[] = result.rows
    if (contracts) res.send(contracts)
  } catch (e) {
    next(e)
  }
}