const { DataTypes, Model } = require('sequelize');
const Favorite = require('./favorites');

const sequelize = require('./db');

class User extends Model {}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'User'
}).hasMany(Favorite, {as: 'favorites', foreignKey: 'userId'});

module.exports = User;