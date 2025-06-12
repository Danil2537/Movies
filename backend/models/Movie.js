const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const Movie = sequelize.define("Movie", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: DataTypes.STRING,
  release_year: DataTypes.INTEGER,
  format: DataTypes.STRING,
});


module.exports = Movie;
