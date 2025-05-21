import "dotenv/config";
import { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

console.log("DATABASE_URL:", process.env.DATABASE_URL);
// Custom SQL logger for debugging
const sqlLogger: Logger = {
  logQuery(query, params) {
    console.log("---SQL Query---");
    console.log("SQL:", query);
    console.log("Params:", params);
    console.log("---------------");
  },
};

// Create the connection
const connection = mysql.createPool(process.env.DATABASE_URL!);

// Initialize drizzle with the connection and logger
export const db = drizzle(connection, { logger: sqlLogger });
