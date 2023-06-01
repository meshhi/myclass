import dotenv from "dotenv";
dotenv.config();
import pkg from 'pg';
const { Client } = pkg;

const pgClient = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
})

export default pgClient;