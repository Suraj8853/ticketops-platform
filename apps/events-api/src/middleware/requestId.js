const { v4: uuidv4 } = require('uuid');
 
// generates a unique request_id per request
// attaches to req and response header
// every log line includes request_id for tracing in Loki
const requestId = (req, res, next) => {
  const id = uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};
 
module.exports = requestId;

