/**
 * @file This file serves as the main controller for any database operation required within the app.
 * @module dbController
 */
const { sql, checkTables } = require("./dbConnection.js");

/**
 * Run our prechecks on the database which includes checking if the
 * tables needed exists and creating them if they don't.
 */
checkTables();

/**
 * The database controller object.
 * Can be used by calling db.createUser(data), db.verifyUser(data), db.getUser(id) etc.
 */
let db = {
  /**
   * Creates a new record in the database for a user.
   * @async
   * @param {Object} data - The data to be inserted into the database.
   * @param {string} data.recId - The users record id.
   * @param {string} data.email - The users email address.
   * @param {string} data.password - The users hashed password.
   * @returns {Promise<Object>} - The newly created record.
   */
  createUser: async (data) => {
    const text =
      "INSERT INTO users(recId, email, password) VALUES($1, $2, $3) RETURNING *";
    const values = [data.recId, data.email, data.password];
    const res = await sql.query(text, values);
    return res.rows[0];
  },
  /**
   * Checks to see if a user exists.
   * @async
   * @param {Object} data - The data to be checked.
   * @param {string} data.email - The users email address.
   * @returns {Promise<Boolean>} - The result from checking if the user exists.
   */
  verifyUser: async (data) => {
    const text = "SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)";
    const values = [data.email];
    const res = await sql.query(text, values);
    return res.rows[0].exists;
  },
  /**
   * Gets the record for a user from the provided email address.
   * @async
   * @param {string} email - The users email address.
   * @returns {Promise<Object>} - The users details.
   */
  getUser: async (email) => {
    const text = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const res = await sql.query(text, values);
    return res.rows[0];
  },
  /**
   * Updates a record in the database for a user's password.
   * @async
   * @param {Object} data - The data to be updated in the database.
   * @param {string} data.recId - The user's record id.
   * @param {string} data.password - The password.
   * @returns {Promise<string>} - The user's record id.
   */
  updatePassword: async (data) => {
    const text = "UPDATE users SET password = $1 WHERE recId = $2";
    const values = [data.password, data.recId];
    await sql.query(text, values);
    return data.recId;
  },
  /**
   * Deletes a record of a user in the database.
   * @async
   * @param {string} recId - The users record id.
   * @returns {Promise<string>} - The deleted users record id.
   */
  deleteUser: async (recId) => {
    const text = "DELETE FROM users WHERE recId = $1";
    const values = [recId];
    await sql.query(text, values);
    return recId;
  },
  /**
   * Creates a new record in the database for a workout.
   * @async
   * @param {Object} data - The data to be inserted into the database.
   * @param {string} data.recId - The workouts record id.
   * @param {string} data.userRecId - The users record id.
   * @param {string} data.workoutName - The workouts name.
   * @returns {Promise<Object>} - The newly created record.
   */
  createWorkout: async (data) => {
    const text =
      "INSERT INTO workouts(recId, userRecId, workoutName) VALUES($1, $2, $3) RETURNING *";
    const values = [data.recId, data.userRecId, data.workoutName];
    const res = await sql.query(text, values);
    return res;
  },
  /**
   * Deletes a record of a workout in the database.
   * @async
   * @param {string} recId - The workouts record id.
   * @returns {Promise<string>} - The deleted workout record id.
   */
  deleteWorkout: async (recId) => {
    const text = "DELETE FROM workouts WHERE recId = $1";
    const values = [recId];
    await sql.query(text, values);
    return recId;
  },
  /**
   * Updates a record in the database for a workout.
   * @async
   * @param {Object} data - The data to be updated in the database.
   * @param {string} data.recId - The workouts record id.
   * @param {string} data.workoutName - The workouts name.
   * @returns {Promise<string>} - The updated workout name.
   */
  updateWorkout: async (data) => {
    const text = "UPDATE workouts SET workoutName = $1 WHERE recId = $2";
    const values = [data.workoutName, data.recId];
    await sql.query(text, values);
    return data.recId;
  },
  /**
   * Reads the workout tables and gets the records that matches the userRecId.
   * @async
   * @param {string} userRecId - The users record id.
   * @returns {Promise<Object>} - The users workouts.
   */
  getWorkouts: async (userRecId) => {
    const text = "SELECT * FROM workouts WHERE userRecId = $1 ORDER BY createdTimeStamp";
    const values = [userRecId];
    const res = await sql.query(text, values);
    return res.rows;
  },
  /**
   * Creates a new record in the database for a exercise.
   * @async
   * @param {Object} data - The data to be inserted into the database.
   * @param {string} data.recId - The workouts record id.
   * @param {string} data.userRecId - The users record id.
   * @param {string} data.workoutRedId - The workout record id.
   * @param {string} data.exerciseName - The exercise name.
   * @param {string} data.sets - The number of sets.
   * @returns {Promise<Object>} - The newly created record.
   */
  createExercise: async (data) => {
    const text =
      "INSERT INTO exercises(recId, userRecId, workoutRecId, exerciseName, sets) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const values = [
      data.recId,
      data.userRecId,
      data.workoutRecId,
      data.exerciseName,
      data.sets,
    ];
    const res = await sql.query(text, values);
    return res;
  },
  /**
   * Deletes a record of a exercise in the database.
   * @async
   * @param {string} recId - The exercise's record id.
   * @returns {Promise<string>} - The deleted exercise's record id.
   */
  deleteExercise: async (recId) => {
    const text = "DELETE FROM exercises WHERE recId = $1";
    const values = [recId];
    await sql.query(text, values);
    return recId;
  },
  updateExercise: async (data) => {
    const text = "UPDATE exercises SET exerciseName = $1, sets = $2 WHERE recId = $3";
    const values = [data.exerciseName, data.sets, data.recId];
    await sql.query(text, values);
    return data.recId;
  },
  /**
   * Reads the exercises tables and gets the records that matches the userRecId.
   * @async
   * @param {string} userRecId - The users record id.
   * @returns {Promise<Object>} - The users exercises.
   */
  getExercises: async (userRecId) => {
    const text = "SELECT * FROM exercises WHERE userRecId = $1 ORDER BY createdTimeStamp";
    const values = [userRecId];
    const res = await sql.query(text, values);
    return res.rows;
  },
};

module.exports = db;
