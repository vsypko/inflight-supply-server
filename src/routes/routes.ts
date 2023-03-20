import express from "express"
import { body } from "express-validator"
import * as auth from "../controlers/auth.controler.js"
import * as search from "../controlers/search.controler.js"
import * as user from "../controlers/user.controler.js"
import { authMiddleware } from "../middlewares/middleware.js"

import multer from "multer"

const upload = multer({ dest: "uploads/" })

const router = express.Router()

const searchRouter = express.Router()
const userRouter = express.Router()

const airportRouter = express.Router()
airportRouter.get("/", search.getAirport)

const authRouter = express.Router()
authRouter.post("/signup", body("email").isEmail(), body("password").isLength({ min: 6, max: 12 }), auth.signup)
authRouter.post("/signin", body("email").isEmail(), body("password").isLength({ min: 6, max: 12 }), auth.signin)
authRouter.get("/update", auth.tokenUpdate)
authRouter.get("/signout", auth.signout)

const usersRouter = express.Router()
usersRouter.get("/", search.getAllUsers)

searchRouter.use("/airport", airportRouter)
searchRouter.use("/users", authMiddleware, usersRouter)

userRouter.use("/auth", authRouter)
userRouter.post("/update", upload.single("avatar"), user.update)

router.use("/user", userRouter)
router.use("/search", searchRouter)

export default router
