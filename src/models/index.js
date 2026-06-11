const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const Order = require('./Order');

const sequelize = new Sequelize(dbConfig);

Order.init(sequelize);

module.exports = { sequelize, Order };
