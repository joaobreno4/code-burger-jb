const { version } = require('../package.json');
const { logRequest } = require('./_lib/observe');

module.exports = (req, res) => {
  logRequest(req, res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ status: 'ok', version });
};
