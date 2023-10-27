import express from "express"
import { body } from "express-validator"
import * as auth from "../controlers/auth.controler.js"
import * as search from "../controlers/search.controler.js"
import * as user from "../controlers/user.controler.js"
import * as company from "../controlers/company.controler.js"
import { authMiddleware } from "../middlewares/middleware.js"
import multer from "multer"

const imgFileStorageConfig = (path: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path)
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    },
  })

const userImgUpload = multer({ storage: imgFileStorageConfig("uploads/uph") })
const itemImgUpload = multer({ storage: imgFileStorageConfig("uploads/itm") })
const router = express.Router()

const searchRouter = express.Router()
const userRouter = express.Router()

const airportRouter = express.Router()
airportRouter.get("/", search.getAirport)
airportRouter.get("/code", search.getAirportbyCode)
airportRouter.get("/schedule", search.getSchedule)

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
const companyItemsRouter = express.Router()
companyRouter.use("/items", companyItemsRouter)

companyRouter.get("/", company.getCompanies)
companyRouter.get("/:type", company.getCompanyItems)
companyRouter.post("/:type", company.insertCompanyItems)
companyRouter.patch("/:type", company.updateCompanyItem)
companyRouter.delete("/:type", company.deleteCompanyItem)
companyItemsRouter.get("/img/:url", company.getItemImgUrl)
companyItemsRouter.post("/img/update", itemImgUpload.single("image"), company.updateItemImg)
companyItemsRouter.delete("/img/:type", company.deleteItemImg)

searchRouter.use("/airport", airportRouter)
searchRouter.use("/users", authMiddleware(4), usersRouter)
searchRouter.use("/countries", countriesRouter)

userRouter.use("/auth", authRouter)
userRouter.post("/updateurl", userImgUpload.single("image"), user.saveUserPhoto)
userRouter.get("/geturl/:url", user.getUserPhoto)
userRouter.delete("/deleteurl/:url", user.removeUserPhoto)
userRouter.post("/updateprofile", user.updateUserProfile)

// companyRouter.use

router.use("/user", userRouter)
router.use("/search", searchRouter)
router.use("/company", companyRouter)

export default router
