const { DataTypes } = require("sequelize");
const sequelize = require('../sequelize');
const Star = sequelize.define("Star", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: DataTypes.STRING,
});


module.exports = Star;
