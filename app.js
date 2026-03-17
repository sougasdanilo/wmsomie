// src/app.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/index.js';

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api', routes);

export default app;