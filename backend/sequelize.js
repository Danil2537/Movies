const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "sqlite", // or "postgres" / "mysql"
  storage: "./database.sqlite", // for SQLite
  logging: console.log,
});

module.exports = sequelize;