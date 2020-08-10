const { DataTypes, Model } = require('sequelize');

const sequelize = require('./db');

class Favorite extends Model {}

Favorite.init({
  productId: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'Favorite'
});

module.exports = Favorite;