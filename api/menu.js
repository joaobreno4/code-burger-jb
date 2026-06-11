const menu = require('../src/data/menu.json');
const { logRequest } = require('./_lib/observe');

module.exports = (req, res) => {
  logRequest(req, res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json(menu);
};
