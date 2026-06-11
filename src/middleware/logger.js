// Emits one JSON line per request so that local dev output matches the Datadog
// schema used by the Vercel Functions in production. Every field maps directly
// to a Datadog log attribute — no custom pipeline or Grok parser required.
function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message: 'request completed',
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode,
      responseTime,
      service: 'code-burger-api',
      env: process.env.NODE_ENV || 'development',
    }));
  });

  next();
}

function errorLogger(err, req, res, next) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    message: err.message,
    method: req.method,
    url: req.originalUrl || req.url,
    stack: err.stack,
    service: 'code-burger-api',
    env: process.env.NODE_ENV || 'development',
  }));
  next(err);
}

module.exports = { logger, errorLogger };
