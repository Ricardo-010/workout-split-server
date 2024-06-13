const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Creates a connection pool to the database.
const sql = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});


/**
 * Checks the tables for the app.
 */
async function checkTables() {
  try {
    await checkTableExists("users", createUsersTable);
    await checkTableExists("workouts", createWorkoutsTable);
    await checkTableExists("exercises", createExerciseTable);
  } catch (error) {
    console.error("Error checking if tables exist.", error);
  }
}

/**
 * Checks to see if the tables needed for the app exist.
 * @param {string} tableName- The tables name.
 * @param {function} createTable - The function to create the relevant table.
 */
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
      if (tableName === "exercises") {
        await createDemoUser();
      }
    } else {
      console.log(`Table ${tableName} exists:`, tableExists);
    }
  } catch (error) {
    console.error(`Error checking if ${tableName} table exists.`, error);
    await createTable();
  }
}

/**
 * Creates the users tables.
 */
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

/**
 * Creates the workouts tables.
 */
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

/**
 * Creates the exercises tables.
 */
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

/**
 * Creates a demo user.
 */
async function createDemoUser() {
  try {
    const userId = uuidv4();
    const pushDayId = uuidv4();
    const pullDayId = uuidv4();
    const legDayId = uuidv4();
    const upperBodyDayId = uuidv4();
    const lowerBodyDayId = uuidv4();

    await sql.query(
      `INSERT INTO users (recId, email, password) VALUES
      ($1, 'demo@user.com', '$2b$08$tDSoPYunn4olGO0VaNFVqOeedgfondpqRi9Enp7zn0xh9Q4TJWqXC');`,
      [userId]
    );

    await sql.query(
      `INSERT INTO workouts (recId, userRecId, workoutName) VALUES
      ($1, $2, 'Push Day'),
      ($3, $2, 'Pull Day'),
      ($4, $2, 'Leg Day'),
      ($5, $2, 'Upper Body Day'),
      ($6, $2, 'Lower Body Day');`,
      [pushDayId, userId, pullDayId, legDayId, upperBodyDayId, lowerBodyDayId]
    );

    await sql.query(
      `INSERT INTO exercises (recId, userRecId, workoutRecId, exerciseName, sets) VALUES
      ($1, $2, $3, 'Bench Press', '3 Sets'),
      ($4, $2, $3, 'Shoulder Press', '3 Sets'),
      ($5, $2, $3, 'Tricep Dips', '3 Sets'),
      ($6, $2, $3, 'Chest Flyes', '3 Sets'),
      ($7, $2, $3, 'Tricep Pushdowns', '3 Sets'),
      ($8, $2, $9, 'Pull-Ups', '3 Sets'),
      ($10, $2, $9, 'Barbell Rows', '3 Sets'),
      ($11, $2, $9, 'Bicep Curls', '3 Sets'),
      ($12, $2, $9, 'Face Pulls', '3 Sets'),
      ($13, $2, $9, 'Lat Pulldowns', '3 Sets'),
      ($14, $2, $15, 'Squats', '3 Sets'),
      ($16, $2, $15, 'Leg Press', '3 Sets'),
      ($17, $2, $15, 'Leg Curls', '3 Sets'),
      ($18, $2, $15, 'Leg Extensions', '3 Sets'),
      ($19, $2, $15, 'Calf Raises', '3 Sets'),
      ($20, $2, $21, 'Incline Bench Press', '3 Sets'),
      ($22, $2, $21, 'Bent Over Rows', '3 Sets'),
      ($23, $2, $21, 'Lateral Raises', '3 Sets'),
      ($24, $2, $21, 'Tricep Extensions', '3 Sets'),
      ($25, $2, $21, 'Bicep Curls', '3 Sets'),
      ($26, $2, $27, 'Deadlifts', '3 Sets'),
      ($28, $2, $27, 'Lunges', '3 Sets'),
      ($29, $2, $27, 'Hamstring Curls', '3 Sets'),
      ($30, $2, $27, 'Glute Bridges', '3 Sets'),
      ($31, $2, $27, 'Calf Raises', '3 Sets');`,
      [
        uuidv4(),
        userId,
        pushDayId,
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        pullDayId,
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        legDayId,
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        upperBodyDayId,
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        lowerBodyDayId,
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
      ]
    );

    console.log("Demo user created.");
  } catch (err) {
    console.error("Error creating demo user.", err);
  }
}

module.exports = { sql, checkTables };
