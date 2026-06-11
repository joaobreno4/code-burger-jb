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

// Emits a structured JSON log line to stdout AND forwards it to Datadog in the
// background (fire-and-forget). The console.log always runs first so the log is
// never lost if the HTTP forward fails.
//
// Fire-and-forget safety in Vercel serverless: after res.end() the Node process
// stays warm for a brief window — enough for a lightweight fetch to complete.
// The .catch() guard prevents the unhandled-rejection that would crash the next
// warm invocation if Datadog is unreachable.
function jsonLog(level, fields) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'code-burger-api',
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    ...fields,
  };

  // Reliable sync path — always runs regardless of Datadog availability.
  console.log(JSON.stringify(entry));

  // Async forward — only when DD_API_KEY is present (production / staging).
  // Not awaited: does not block res.end() or add latency to the response.
  const apiKey = process.env.DD_API_KEY;
  if (apiKey) {
    fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': apiKey,
      },
      body: JSON.stringify([entry]),
    }).catch(() => { /* best-effort — never surface Datadog errors to callers */ });
  }
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
