import express from "express"
import { body } from "express-validator"
import * as auth from "../controlers/auth.controler.js"
import * as search from "../controlers/search.controler.js"
import * as user from "../controlers/user.controler.js"
import * as company from "../controlers/company.controler.js"
import * as contract from "../controlers/contract.controler.js"
import * as order from "../controlers/order.controler.js"
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

//main routs-------------------------------------------------
const userImgUpload = multer({ storage: imgFileStorageConfig("uploads/uph") })
const itemImgUpload = multer({ storage: imgFileStorageConfig("uploads/itm") })
const router = express.Router()

const searchRouter = express.Router()
const authRouter = express.Router()
const userRouter = express.Router()
const airportRouter = express.Router()
const usersRouter = express.Router()
const countriesRouter = express.Router()
const companyRouter = express.Router()
const companyItemsRouter = express.Router()
const contractRouter = express.Router()
const orderRouter = express.Router()

//add main routes ------------------------------------------------------------
router.use("/user", userRouter)
router.use("/search", searchRouter)
router.use("/company", companyRouter)
router.use("/contract", contractRouter)
router.use("/orders", orderRouter)

//uses routes ---------------------------------------------------------
companyRouter.use("/items", companyItemsRouter)
searchRouter.use("/airport", airportRouter)
searchRouter.use("/users", authMiddleware(4), usersRouter)
searchRouter.use("/countries", countriesRouter)

//queries for AUTH_ROUTER---------------------------------------------------------------------
authRouter.post("/signup", body("email").isEmail(), body("password").isLength({ min: 6, max: 12 }), auth.signup)
authRouter.post("/signin", body("email").isEmail(), body("password").isLength({ min: 6, max: 12 }), auth.signin)
authRouter.get("/update", auth.tokenUpdate)
authRouter.get("/signout", auth.signout)

//queries for USER_ROUTER---------------------------------------------------------------------
userRouter.use("/auth", authRouter)
userRouter.post("/updateurl", userImgUpload.single("image"), user.saveUserPhoto)
userRouter.get("/geturl/:url", user.getUserPhoto)
userRouter.delete("/deleteurl/:url", user.removeUserPhoto)
userRouter.post("/updateprofile", user.updateUserProfile)

//queries for AIRPORT_ROUTER------------------------------------------------------------------
airportRouter.get("/", search.getAirport)
airportRouter.get("/code", search.getAirportbyCode)
airportRouter.get("/schedule", search.getSchedule)

//queriws for USERS_ROUTER--------------------------------------------------------------------
usersRouter.get("/", search.getAllUsers)

//queries for COUNTRIES_ROUTER----------------------------------------------------------------
countriesRouter.get("/", search.getAllCountries)

//queries for COMPANIES_ROUTER----------------------------------------------------------------
companyRouter.post("/", company.createCompany)
companyRouter.get("/", company.getCompanies)
companyRouter.get("/airport", company.getCompaniesForAirport)
companyRouter.get("/:type", company.getCompanyItems)
companyRouter.post("/:type", company.insertCompanyItems)
companyRouter.patch("/:type", company.updateCompanyItem)
companyRouter.delete("/:type", company.deleteCompanyItem)

//queries for COMPANY_ITEM_ROUTER-------------------------------------------------------------
companyItemsRouter.get("/img/:url", company.getItemImgUrl)
companyItemsRouter.post("/img/update", itemImgUpload.single("image"), company.updateItemImg)
companyItemsRouter.delete("/img/:type", company.deleteItemImg)

//queries for CONTRACT_ROUTER-----------------------------------------------------------------
contractRouter.get("/", contract.getContract)
contractRouter.post("/", authMiddleware(2), contract.createContract)
contractRouter.patch("/", authMiddleware(2), contract.signContract)
contractRouter.delete("/", authMiddleware(2), contract.rejectContract)

//queries for ORDER_ROUTER-------------------------------------------------------------------
orderRouter.get("/", order.getFlights)

export default router
