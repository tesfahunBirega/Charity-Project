const path = require('path');
const configs = require('./config');
const { User, UserProfile, userAdmin, Event, FeedBack, Donation, Post, Voluntery } = require('../models/index');

// const userProfile = require('../models/userProfile.model.js');
// const userAdmin = require('../models/userAdmin.model.js');

// configuration file for TypeORM db connection

module.exports = {
  type: 'postgres', // Change the type to mysql
  host: configs.postgres.host, // Use MySQL host configuration
  port: configs.postgres.port, // Use MySQL port configuration
  username: configs.postgres.userName, // Use MySQL username configuration
  password: configs.postgres.password, // Use MySQL password configuration
  database: configs.postgres.database, // Use MySQL database configuration
  // entities: [__dirname + "/../models/*.js"],
  entities: [User, UserProfile, userAdmin, Event, FeedBack, Donation, Post, Voluntery],

  synchronize: true,
  // migrationsRun: true,
  migrations: [path.join(__dirname, '../migrations/*.js')], // Path to migration files
  cli: {
    entitiesDir: path.join(__dirname, '../models'),
    migrationsDir: path.join(__dirname, '../migrations*.js'),
  },
  extra: {
    connectionLimit: configs.postgres.maxConn, // Set the pool size to MySQL configuration
    idleTimeoutMillis: configs.postgres.idleTimeOut,
    connectionTimeoutMillis: configs.postgres.connTimeOut,
  },
};
