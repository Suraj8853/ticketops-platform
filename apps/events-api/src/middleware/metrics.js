const { httpRequestsTotal, httpDuration } = require('../config/metrics');

const metricsMiddleware = (req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, route: req.path });

  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
    end();
  });

  next();
};

module.exports = metricsMiddleware;
