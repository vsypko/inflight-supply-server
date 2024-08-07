import { Request, Response, NextFunction } from 'express'
import db from '../db/db.js'
import { IContract } from '../types.js'

export async function createContract(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { airport, airline, supplier, airline_signatory } = req.body
    if (!airport || !airline || !supplier || !airline_signatory)
      throw { staus: 400, data: 'Bad request' }

    const createdContract = await db.query(
      'INSERT INTO contracts (airport, airline, supplier, airline_signatory) VALUES($1, $2, $3, $4) RETURNING *',
      [airport, airline, supplier, airline_signatory]
    )

    if (!createdContract.rowCount) throw { staus: 400, data: 'Bad request' }

    res.send({ data: 'Contract created' })
  } catch (e) {
    next(e)
  }
}

export async function getContract(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { ap, co, cat } = req.query
    if (!ap || !co || !cat) throw { status: 400, data: 'Bad request' }

    let result: any

    if (cat === 'airline') {
      result = await db.query(
        'SELECT ct.*, co.name, co.reg_number, co.country_iso FROM contracts ct INNER JOIN companies co ON ct.supplier = co.id WHERE ct.airport=$1 AND ct.airline=$2',
        [ap, co]
      )
    } else {
      result = await db.query(
        'SELECT ct.id, ct.signed_at, ct.airline, ct.supplier, ct.airport, ct.airline_signatory, ct.supplier_signatory, co.name, co.reg_number, co.iata, co.country_iso FROM contracts ct INNER JOIN companies co ON ct.airline = co.id WHERE ct.airport=$1 AND ct.supplier=$2',
        [ap, co]
      )
    }
    const contracts: IContract[] = result.rows

    if (contracts) res.send(contracts)
  } catch (e) {
    next(e)
  }
}

export async function signContract(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, user } = req.body
    if (!id || !user) throw { status: 400, data: 'Bad request' }
    const result = await db.query(
      'UPDATE contracts SET signed_at=Now(), supplier_signatory=$2 WHERE id=$1 RETURNING *',
      [id, user]
    )
    const contract: IContract = result.rows[0]
    if (!contract)
      throw { status: 400, data: 'Bad request. Contract not found' }
    res.send(contract)
  } catch (e) {
    next(e)
  }
}

export async function rejectContract(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query.q
    if (!query) throw { status: 400, data: 'Bad request' }
    const result = await db.query('DELETE FROM contracts WHERE id=$1', [query])
    if (!result.rowCount)
      throw { status: 400, data: 'Bad request. Contract not found' }
    res.send({ data: 'Contract rejected' })
  } catch (e) {
    next(e)
  }
}
