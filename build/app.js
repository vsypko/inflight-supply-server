import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import router from "./routes/routes.js";
import { errorMiddleware } from "./middlewares/middleware.js";
dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 3001;
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("uploads"));
app.use("/api", router);
app.use(errorMiddleware);
app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.listen(port, () => console.log(`[server] running at http://localhost:${port}`));
//# sourceMappingURL=app.js.map