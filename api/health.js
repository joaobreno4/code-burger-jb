const { version } = require('../package.json');
const { withResponseTime } = require('./_lib/observe');

module.exports = (req, res) => {
  withResponseTime(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ status: 'ok', version });
};
