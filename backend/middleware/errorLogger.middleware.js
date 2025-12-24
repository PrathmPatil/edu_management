const logger = require('../logger'); // Winston logger

const errorLogger = (err, req, res, next) => {
  // Log error with request info
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    body: req.body
  });

  // Pass error to default error handler
  next(err);
};

module.exports = errorLogger;
