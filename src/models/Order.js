const { Model, DataTypes } = require('sequelize');

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        clientName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        order: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'Em preparação',
        },
      },
      {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
      }
    );

    return this;
  }
}

module.exports = Order;
