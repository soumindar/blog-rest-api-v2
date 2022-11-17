const dotenv = require("dotenv");
dotenv.config();
/**
 *
 * DB Configuration
 *
 */
module.exports = {
  HOST: process.env.DB_HOST ?? "localhost",
  USER: process.env.DB_USERNAME ?? "postgres",
  PASSWORD: process.env.DB_PASSWORD ?? "password",
  DB: process.env.DB_NAME ?? "postgres",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};