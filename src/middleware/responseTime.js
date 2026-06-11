function responseTime(req, res, next) {
  const start = process.hrtime.bigint();

  const originalEnd = res.end.bind(res);
  res.end = (...args) => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    res.setHeader('X-Response-Time', `${ms.toFixed(2)}ms`);
    return originalEnd(...args);
  };

  next();
}

module.exports = responseTime;
