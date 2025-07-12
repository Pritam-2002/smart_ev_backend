import express from "express";
import { login, register, updateLocation,getDirections} from "../controller/driver.controller.js";
import { isAuth } from "../middleware/isAuth.js";
const router=express.Router()

router.post("/register",register)
router.post("/login",login)
router.patch("/location",isAuth,updateLocation)
router.post("/getdirection",getDirections)

export default router;