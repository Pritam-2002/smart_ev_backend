import express from 'express';
const app = express();
import authRoutes from './router/driver.router.js';

import { configDotenv } from 'dotenv';
configDotenv();
import { connecttodb } from './db/db.js';

const PORT = process.env.PORT

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/driver', authRoutes);
// app.use('/api/stations', stationRoutes);
// app.use('/api/predictions', predictionRoutes);


app.listen(PORT, () => {
    connecttodb();
    console.log(`Server is running on port ${PORT}`);
});

export default app;