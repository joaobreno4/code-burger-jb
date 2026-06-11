const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const Order = require('./Order');
const User = require('./User');

const sequelize = new Sequelize(dbConfig);

Order.init(sequelize);
User.init(sequelize);

module.exports = { sequelize, Order, User };
