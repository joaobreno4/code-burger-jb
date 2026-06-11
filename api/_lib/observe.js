// DB connection error codes from Node.js / pg driver
const CONNECTION_CODES = new Set([
  'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EPIPE',
]);

function isDbConnectionError(err) {
  return (
    CONNECTION_CODES.has(err.code) ||
    (err.message && /connect|timeout|connection refused/i.test(err.message))
  );
}

function handleDbError(res, err) {
  console.error(`[${new Date().toISOString()}] DB_ERROR ${err.code || ''} ${err.message}`);

  if (isDbConnectionError(err)) {
    return res.status(503).json({
      error: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
    });
  }

  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

// Wraps res.end to inject X-Response-Time before the response is sent
function withResponseTime(res) {
  const start = process.hrtime.bigint();
  const originalEnd = res.end.bind(res);

  res.end = (...args) => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    res.setHeader('X-Response-Time', `${ms.toFixed(2)}ms`);
    return originalEnd(...args);
  };
}

module.exports = { withResponseTime, handleDbError };
