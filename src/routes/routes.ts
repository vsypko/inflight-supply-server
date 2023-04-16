import express from "express"
import { body } from "express-validator"
import * as auth from "../controlers/auth.controler.js"
import * as search from "../controlers/search.controler.js"
import * as user from "../controlers/user.controler.js"
import * as company from "../controlers/company.controler.js"
import { authMiddleware } from "../middlewares/middleware.js"
import multer from "multer"

const fileStorageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/uph")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const photoUpload = multer({ storage: fileStorageConfig })
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

const countriesRouter = express.Router()
countriesRouter.get("/", search.getAllCountries)

const companyRouter = express.Router()
companyRouter.get("/flights", company.getFlights)
companyRouter.post("/flights", company.updateFlights)
companyRouter.delete("/flight", company.deleteFlight)

searchRouter.use("/airport", airportRouter)
searchRouter.use("/users", authMiddleware(2), usersRouter)
searchRouter.use("/countries", countriesRouter)

userRouter.use("/auth", authRouter)
userRouter.post("/updateurl", photoUpload.single("photo"), user.saveUserPhoto)
userRouter.post("/updateprofile", user.updateUserProfile)
userRouter.get("/geturl/:url", user.getUserPhoto)
userRouter.delete("/deleteurl/:url", user.removeUserPhoto)

companyRouter.use

router.use("/user", userRouter)
router.use("/search", searchRouter)
router.use("/company", companyRouter)

export default router
