// config/dbConfig.js
// module.exports = {

//   // user: "AK",
//   // password: "2652",
//   // server: "192.168.29.35",
//   // database: "YJKERP_GOLD",
//   // port: 63213,
//   // options: {
//   //   encrypt: false,
//   // },   
//   // user: "saraswathi",
//   // password: "@%dSCt15",
//   // server: "95.216.47.253",
//   // database: "Development_ERP_Gold",
//   // port: 1433,
//   // options: {
//   //   encrypt: false,
//   // },   
//   user: "saraswathi",
//   password: "@%dSCt15",
//   server: "95.216.47.253",
//   database: "Latest_ERP_GOLD",
//   port: 1433,
//   options: {
//     encrypt: false,
//   },   
// };

const path = require("path");
const dotenv = require("dotenv");

// Load backend/.env
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

module.exports = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
  },
  requestTimeout: Number(process.env.DB_REQUEST_TIMEOUT) || 300000,
  connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT) || 300000,
};