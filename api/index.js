const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const { expressjwt } = require("express-jwt");
const port = 3030;
const auth = require("./auth/auth.js");
const dbController = require("./database/dbController.js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

/** Middleware setup */
app.use(express.json()); // Parses incoming JSON bodies.
app.use(cors()); // Enables CORS, allowing requests from different origins
app.use(helmet()); // Adds security HTTP headers
const requireAuth = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: [process.env.JWT_ALGORITHMS],
}); // express-jwt middleware which will validate a JWT

/**
 * @api {get} / welcome message to be the front of this api
 * @apiSuccess (200) {String} Welcome to the Workout App API!
 */
app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Workout App API!");
});

/**
 * @api {post} /register Create a new user
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user data.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @apiSuccess (201) {Object} message User created successfully; userId The user's unique record ID.
 * @apiError (409) {String} message User already exists.
 * @apiError (500) {String} message Failed to create user.
 */
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    let data = {
      recId: uuidv4(),
      email: email,
      password: await auth.hashPassword(password),
    };

    const userExists = await dbController.verifyUser(data);
    if (!userExists) {
      const userDetails = await dbController.createUser(data);
      const token = auth.generateJWT(userDetails);
      res.status(201).send({
        message: "User created successfully.",
        token: token,
      });
    } else {
      res.status(409).send("User already exists.");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Failed to create user. Please try again.");
  }
});

/**
 * @api {post} /login Handle a user trying to login
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user data.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @apiSuccess (200) {Object} message User login successful; userId The user's unique record ID.
 * @apiError (403) {String} error User does not exist or invalid login details.
 * @apiError (500) {String} error Login failed. Please try again.
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let data = {
      email: email,
      password: password,
    };

    const userExists = await dbController.verifyUser(data);
    if (userExists) {
      const userDetails = await dbController.getUser(data.email);
      if (await auth.validPassword(data.password, userDetails.password)) {
        const token = auth.generateJWT(userDetails);
        res.status(200).send({
          message: "User login successful",
          token: token,
        });
      } else {
        return res.status(403).send("Invalid login details.");
      }
    } else {
      res.status(403).send("Account does not exist.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Login failed. Please try again.");
  }
});

/**
 * @api {post} /user Updates a user's password.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user data.
 * @param {string} req.body.recId - The user's recId.
 * @param {string} req.body.password - The user's new password.
 * @apiSuccess (200) {String} Password updated successfully!
 * @apiError (500) {String} error Error during updating password. Please try again.
 */
app.put("/user", requireAuth, async (req, res) => {
  try {
    const { recId, password } = req.body;
    let data = {
      recId: recId,
      password: await auth.hashPassword(password),
    };
    await dbController.updatePassword(data);
    res
      .status(200)
      .send("Password updated successfully!");
  } catch (error) {
    console.error("Error during updating password:", error);
    res.status(500).send("Error during updating password. Please try again.");
  }
});

/**
 * @api {delete} /user/:userId Deletes a user
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters containing the user data.
 * @param {string} req.params.workoutId - The user's record id.
 * @apiSuccess (204) Sends back no content.
 * @apiError (500) {String} error Error during deleting a user. Please try again.
 */
app.delete("/user/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    await dbController.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    console.error("Error during deleting user:", error);
    res.status(500).send("Error during deleting account. Please try again.");
  }
});

/**
 * @api {get} /workouts Handle getting workouts and exercises that match a users recId
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters containing the user data.
 * @param {string} req.params.userId - The user's recId.
 * @apiSuccess (200) {Object} usersWorkouts The users workouts; usersExercises The users exercises.
 * @apiError (500) {String} error Error fetching workouts. Please refresh the page.
 */
app.get("/workouts", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const usersWorkouts = await dbController.getWorkouts(userId);
    const usersExercises = await dbController.getExercises(userId);
    res
      .status(200)
      .send({ usersWorkouts: usersWorkouts, usersExercises: usersExercises });
  } catch (error) {
    console.error("Error during fetching workouts and exercises:", error);
    res.status(500).send("Error fetching workouts. Please refresh the page.");
  }
});

/**
 * @api {post} /workouts Creates a workout for the user
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user data.
 * @param {string} req.body.userId - The user's recId.
 * @param {string} req.body.workoutName - The workouts name.
 * @apiSuccess (201) {Object} message: Workout created successfully!, workout: the newly created workout
 * @apiError (500) {String} error Error during creating workout. Please try again.
 */
app.post("/workouts", requireAuth, async (req, res) => {
  try {
    const { workoutName } = req.body;
    const userId = req.auth.userId;
    let data = {
      recId: uuidv4(),
      userRecId: userId,
      workoutName: workoutName,
    };
    await dbController.createWorkout(data);
    res
      .status(201)
      .send({ message: "Workout created successfully!", workout: data });
  } catch (error) {
    console.error("Error during creating workout:", error);
    res.status(500).send("Error during creating workout. Please try again.");
  }
});

/**
 * @api {post} /workouts Updates a workout for the user
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user data.
 * @param {string} req.body.recId - The workouts recId.
 * @param {string} req.body.workoutName - The workout name.
 * @apiSuccess (200) {String} Workout updated successfully!
 * @apiError (500) {String} error Error during updating workout. Please try again.
 */
app.put("/workouts", requireAuth, async (req, res) => {
  try {
    const { recId, workoutName } = req.body;
    let data = {
      recId: recId,
      workoutName: workoutName,
    };
    await dbController.updateWorkout(data);
    res
      .status(200)
      .send("Workout updated successfully!");
  } catch (error) {
    console.error("Error during updating workout:", error);
    res.status(500).send("Error during updating workout. Please try again.");
  }
});

/**
 * @api {delete} /workouts/:workoutId Deletes a workout for the user
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters containing the user data.
 * @param {string} req.params.workoutId - The user's workoutId.
 * @apiSuccess (204) Sends back no content.
 * @apiError (500) {String} error Error during deleting workout. Please try again.
 */
app.delete("/workouts/:workoutId", requireAuth, async (req, res) => {
  try {
    const { workoutId } = req.params;
    await dbController.deleteWorkout(workoutId);
    res.status(204).send();
  } catch (error) {
    console.error("Error during deleting workout:", error);
    res.status(500).send("Error during deleting workout. Please try again.");
  }
});

/**
 * @api {post} /exercises Creates a exercise for the user
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user data.
 * @param {string} req.body.userId - The user's recId.
 * @param {string} req.body.workoutId - The workouts recId.
 * @param {string} req.body.exerciseName - The exercise name.
 * @param {string} req.body.sets - The sets.
 * @apiSuccess (201) {String} message Exercise created successfully!, exercise The new exercise
 * @apiError (500) {String} error Error during creating exercise. Please try again.
 */
app.post("/exercises", requireAuth, async (req, res) => {
  try {
    const { workoutRecId, exerciseName, sets } = req.body;
    const userId = req.auth.userId;
    let data = {
      recId: uuidv4(),
      userRecId: userId,
      workoutRecId: workoutRecId,
      exerciseName: exerciseName,
      sets: sets,
    };
    await dbController.createExercise(data);
    res
      .status(201)
      .send({ message: "Exercise created successfully!", exercise: data });
  } catch (error) {
    console.error("Error during creating exercise:", error);
    res.status(500).send("Error during creating exercise. Please try again.");
  }
});

/**
 * @api {post} /exercises Updates a exercise for the user
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user data.
 * @param {string} req.body.recId - The workouts recId.
 * @param {string} req.body.exerciseName - The exercise name.
 * @param {string} req.body.sets - The sets.
 * @apiSuccess (200) {String} Exercise updated successfully!
 * @apiError (500) {String} error Error during updating exercise. Please try again.
 */
app.put("/exercises", requireAuth, async (req, res) => {
  try {
    const { recId, exerciseName, sets } = req.body;
    let data = {
      recId: recId,
      exerciseName: exerciseName,
      sets: sets,
    };
    await dbController.updateExercise(data);
    res
      .status(200)
      .send("Exercise updated successfully!");
  } catch (error) {
    console.error("Error during updating exercise:", error);
    res.status(500).send("Error during updating exercise. Please try again.");
  }
});

/**
 * @api {delete} /exercises/:exerciseId Deletes a exercise for the user
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters containing the user data.
 * @param {string} req.params.workoutId - The user's workoutId.
 * @apiSuccess (204) Sends back no content.
 * @apiError (500) {String} error Error during deleting exercise. Please try again.
 */
app.delete("/exercises/:exerciseId", requireAuth, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    await dbController.deleteExercise(exerciseId);
    res.status(204).send();
  } catch (error) {
    console.error("Error during deleting exercise:", error);
    res.status(500).send("Error during deleting exercise. Please try again.");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
