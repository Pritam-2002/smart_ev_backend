import express from "express";
import {getcurruser} from '../controller/auth.controller.js';
import {isAuth} from '../middleware/isAuth.js';

const authrouter=express.Router();

authrouter.get("/getcurruser",isAuth,getcurruser)


export default authrouter