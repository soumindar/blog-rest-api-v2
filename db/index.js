const dbConfig = require("../config/db/db.config");
const Sequelize = require("sequelize");
const Models = require('./models');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  omitNull: true,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("DB Failed to connect : ", err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.model = Models(sequelize, Sequelize);

module.exports = db;