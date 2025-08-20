import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './utils/config.js';
import gameapiRouter from './controllers/gameapi.js';
import { middleware } from './utils/middleware.js';
import { logger } from './utils/logger.js';

const app = express();

mongoose.set('strictQuery', false);

logger.info('connecting to', process.env.NODE_ENV);
logger.info('connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/games', gameapiRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
