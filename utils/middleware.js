import { logger } from './logger.js';

const requestLogger = (request, response, next) => {
  logger.info('=== INCOMING REQUEST ===');
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  if(request.query && Object.keys(request.query).length > 0){
    logger.info('Query: ', request.query);
  }
  if(request.body && Object.keys(request.body).length > 0){
    logger.info('Body:  ', request.body);
  }
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

// eslint-disable-next-line consistent-return
const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const middleware = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};

export { middleware };
