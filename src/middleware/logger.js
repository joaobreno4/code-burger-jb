function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(
      `[${new Date().toISOString()}] ${level} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}

function errorLogger(err, req, res, next) {
  console.error(
    `[${new Date().toISOString()}] ERROR ${req.method} ${req.path} — ${err.message}`
  );
  next(err);
}

module.exports = { logger, errorLogger };
