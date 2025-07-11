import express from "express";
import { getAllStations, getStationById, getNearbyStations , updateRealTimeData } from "../controller/station.controller.js";
import { isAuth } from "../middleware/isAuth.js";
const router=express.Router()

router.get('/getAllStations', isAuth, getAllStations);
router.get('/getStationById/:id', isAuth, getStationById);
router.get('/getNearbyStations', isAuth, getNearbyStations);
router.patch('/updateRealTimeData/:id', isAuth, updateRealTimeData);

export default router;