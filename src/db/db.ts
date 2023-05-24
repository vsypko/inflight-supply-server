import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

pg.types.setTypeParser(1700, (x) => parseFloat(x))

const pool = new pg.Pool({
  connectionString: process.env.DB_CONNECTION,
  ssl: { rejectUnauthorized: false },
})

export default pool
