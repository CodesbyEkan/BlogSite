import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  },
);

const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database successfully connected!");
    await sequelize.sync();
  } catch (err) {
    console.log("error: ", err.message);
  }
};

export default connectToDB;
