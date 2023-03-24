import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const pool = new pg.Pool({
    connectionString: process.env.DB_CONNECTION,
    ssl: { rejectUnauthorized: false },
});
export default pool;
//# sourceMappingURL=db.js.map