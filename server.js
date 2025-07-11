import express from 'express';
const app = express();
import authRoutes from './router/driver.router.js';
import isauth from './router/auth.router.js'
import stationRoutes from './router/station.router.js';
import cors from 'cors';

import cookieParser from "cookie-parser";
import { configDotenv } from 'dotenv';
configDotenv();
import { connecttodb } from './db/db.js';

const PORT = process.env.PORT

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use('/api/driver', authRoutes);
app.use('/api/auth', isauth);
app.use('/api/stations', stationRoutes);
// app.use('/api/predictions', predictionRoutes);


app.listen(PORT, () => {
    connecttodb();
    console.log(`Server is running on port ${PORT}`);
});

export default app;