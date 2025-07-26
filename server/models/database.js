// This is where we set up our database connection
// Getting the environment variables from .env file
require('dotenv').config();

const { Sequelize } = require('sequelize');

// Making sure that we have the right environment variable (local vs production)
const dbURL = process.env.RAILWAY_ENVIRONMENT_NAME
    ? process.env.DATABASE_URL // if deployed on Railway, use the DATABASE_URL
    : process.env.DATABASE_PUBLIC_URL; // otherwise, use the public database URL

// Create a new Sequelize instance with the database URL from environment variables
// This is for connecting to a PostgreSQL database, with SSL options for secure connections
const sequelize = new Sequelize(dbURL, {
    dialect: 'postgres',
    dialectOptions:{
        ssl: {
            require:true,
            rejectUnauthorized: false // This is important for self-signed certificates
        }
    }
});

// Export the sequelize instance for use in other parts of the application
// This allows us to interact with the database using Sequelize's ORM capabilities
module.exports = sequelize;
