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

// Emits a single JSON log line that Datadog Log Forwarder parses automatically.
// Fields follow the Datadog standard HTTP attribute naming convention so they
// surface in Log Explorer and dashboards without needing a custom pipeline.
function jsonLog(level, fields) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: 'code-burger-api',
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    ...fields,
  }));
}

// Wraps res.end to:
//   1. compute response time and inject X-Response-Time header
//   2. emit a structured JSON access log once the response is committed
// Replaces the old withResponseTime() — call logRequest(req, res) at the top
// of every Vercel Function handler instead.
function logRequest(req, res) {
  const start = process.hrtime.bigint();
  const originalEnd = res.end.bind(res);

  res.end = (...args) => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    try {
      if (!res.headersSent) res.setHeader('X-Response-Time', `${ms.toFixed(2)}ms`);
    } catch (_) { /* headers already locked — safe to skip */ }

    const statusCode = res.statusCode || 200;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    jsonLog(level, {
      message: 'request completed',
      method: req.method,
      url: req.url,
      statusCode,
      responseTime: parseFloat(ms.toFixed(2)),
    });

    return originalEnd(...args);
  };
}

function handleDbError(res, err) {
  jsonLog('error', {
    message: err.message,
    error_code: err.code || null,
    error_type: isDbConnectionError(err) ? 'db_connection' : 'db_query',
  });

  if (isDbConnectionError(err)) {
    return res.status(503).json({
      error: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
    });
  }

  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = { logRequest, handleDbError, jsonLog };
