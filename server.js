const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const port = process.env.PORT || 5000;
const database = process.env.DATABASE;

mongoose
  .connect(database)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION. SHUTTING DOWN...");
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION. SHUTTING DOWN...");
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
