import express from "express";
import { getAllStations, findallstations } from "../controller/station.controller.js";
import { isAuth } from "../middleware/isAuth.js";
import { getBestEVStation } from "../utils/gemini.js";
const router=express.Router()

router.get('/getAllStations', getAllStations);
router.get('/findallstation', findallstations);
router.post('/recommend', getBestEVStation);

export default router;