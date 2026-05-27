const logger = require('../utils/logger');
 
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  logger.error({
    message: err.message,
    request_id: req.requestId,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(status).json({
    error: err.message || 'Internal server error',
    request_id: req.requestId,
  });
};
 
module.exports = errorHandler;
