const { Pool } = require("pg");
require("dotenv").config();

const sql = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function checkTables() {
  try {
    await checkTableExists("users", createUsersTable);
    await checkTableExists("workouts", createWorkoutsTable);
    await checkTableExists("exercises", createExerciseTable);
  } catch (error) {
    console.error("Error checking if tables exist.", error);
  }
}

async function checkTableExists(tableName, createTable) {
  try {
    const result = await sql.query(
      `SELECT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = $1);`,
      [tableName]
    );

    const tableExists = result.rows[0].exists;
    if (!tableExists) {
      console.log(`${tableName} table does not exist, creating it now.`);
      await createTable();
    } else {
      console.log(`Table ${tableName} exists:`, tableExists);
    }
  } catch (error) {
    console.error(`Error checking if ${tableName} table exists.`, error);
    await createTable();
  }
}

async function createUsersTable() {
  try {
    await sql.query(
      `CREATE TABLE users (
          recId UUID PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL
        );
      `
    );
    console.log("Users table created.");
  } catch (err) {
    console.error("Error creating users table.", err);
  }
}

async function createWorkoutsTable() {
  try {
    await sql.query(
      `CREATE TABLE workouts (
          recId UUID PRIMARY KEY,
          createdTimeStamp TIMESTAMPTZ DEFAULT now(),
          userRecId UUID NOT NULL,
          workoutName VARCHAR(255) NOT NULL,
          FOREIGN KEY (userRecId) REFERENCES users(recId) ON DELETE CASCADE
        );
      `
    );
    console.log("Workouts table created.");
  } catch (err) {
    console.error("Error creating workouts table.", err);
  }
}

async function createExerciseTable() {
  try {
    await sql.query(
      `CREATE TABLE exercises (
          recId UUID PRIMARY KEY,
          createdTimeStamp TIMESTAMPTZ DEFAULT now(),
          userRecId UUID NOT NULL,
          workoutRecId UUID NOT NULL,
          exerciseName VARCHAR(255) NOT NULL,
          sets VARCHAR(50) NOT NULL,
          FOREIGN KEY (userRecId) REFERENCES users(recId) ON DELETE CASCADE,
          FOREIGN KEY (workoutRecId) REFERENCES workouts(recId) ON DELETE CASCADE
        );
      `
    );
    console.log("Exercises table created.");
  } catch (err) {
    console.error("Error creating exercises table.", err);
  }
}

module.exports = { sql, checkTables };
