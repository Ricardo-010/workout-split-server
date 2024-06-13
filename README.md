# Workout Tracker Server - Node.js Server

The Workout Tracker Server is the backbone of the Workout Tracker App, it's responsible for handling user authentication, managing workout and exercise data, and providing the necessary end-points for the client. This server is built using Node.js and Express, and it interacts with a postgres database using docker to store and retrieve data.


## Table of Contents

- [ Server Setup](#server-setup)
- [Project Structure](#project-structure)
- [Core Functionality](#core-functionality)
- [Approaches and Reasoning](#approaches-and-reasoning)

## Server Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/UniSunshineCoast/csc301-24-assignment-3-secondary-Ricardo-USC.git
   cd csc301-24-assignment-3-secondary-Ricardo-USC
   ```

2. **Install the project dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables**
    Create a .env file in the root directory and add these variables:
    ```bash
    SERVER_PORT=3030
    POSTGRES_DB=workout_db
    POSTGRES_USER=admin
    POSTGRES_PASSWORD=admin123
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432

    JWT_SECRET=thisIsASecret
    JWT_EXPIRES_IN=5h
    JWT_ALGORITHMS=HS256
    ```

4. **Setting up docker to run the psotgres DB**
    Ensure you have docker installed.
    ```bash
    docker-compose up -d
    ```

5. **Start the server:**
   ```bash
   npm start
   ```


## Project Structure

```plaintext
csc301-24-assignment-3-secondary-Ricardo-USC/
├── api
│   ├── auth/             # Stores the helper functions for authentication
│   ├── database/         # Stores the database connection and the database controller
│   └── index.js          # Main entry point for the API and all its end=points
├── .env                  # Stores the environment variables for the API for easy access
├── docker-compose.yaml   # Defines the Docker databse services
├── package.json          # The project's dependencies
└── README.md             # The project documentation
```


## Core Functionality

* Authentication (Registration, Login/Logout).

* CRUD operations for workouts, exercises and users.

* Token authentication using JWT for private end-points.

* Secure password hashing using bcrypt.


## Approaches and Reasoning

### Node.js and Express
Node.js and Express provides a minimal and flexible framework for building APIs.

### JSON Web Tokens (JWT)
JWTs are used for generating authentication tokens, providing a secure way to verify user identities and manage sessions. They are stateless and can be easily validated on the server side.

### bcrypt
bcrypt is used for hashing and salting the users passwords, ensuring that user credentials are stored securely in the database, so they are not just stored as strings.

### Postgres Database
Postgres is used as the apps database. It is intuitive to use and was pretty easy to set up which made it a no brainer.

The server creates a connection to the database and checks if there are tables in the database if there isnt the tables will be created. This ensures there will be no errors when trying to interact with tables that dont exists.

When a user interacts with the front-end and tries to interact with any of the data within the database the server uses a database controller which is whats handles all the database queries.

### Authentication
When a user registers or logs in, their email address and password are first verified to ensure they are valid. Once the credentials are verified, a JWT token is generated with the user's email and an expiration time (which I set to 6 hours). After this, any subsequent calls to the API endpoints are verified to ensure the token is still valid or to make sure a token was provided. If a token is not valid or not provided, the endpoint will not be accessible, and the client will receive an unauthorized error.


### Middleware
express.json()

The express.json() middleware is used to parse incoming JSON payloads. It is a built-in middleware function in Express and helps in reading the req.body of incoming requests, making it easier to handle JSON data.

cors()

The cors() middleware enables Cross-Origin Resource Sharing (CORS). This is crucial for allowing requests to the server from different origins, such as from a front-end application running on a different domain or port. By enabling CORS, the server can handle requests from various clients securely.

helmet()

The helmet() middleware adds various security-related HTTP headers to responses. It helps protect the app from some well-known web vulnerabilities by setting appropriate HTTP headers, such as Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and others. This enhances the overall security of the application.

expressjwt()

The expressjwt() middleware from the express-jwt library is used to validate JSON Web Tokens (JWT). It ensures that incoming requests contain a valid JWT before allowing access to protected routes.

The requireAuth middleware can be applied to specific routes that require authentication, ensuring that only authenticated users can access those routes.