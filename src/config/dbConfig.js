const path = require('path');
const configs = require('./config');
const { User, UserProfile, userAdmin, Event, FeedBack, Donation, Post, Voluntery } = require('../models/index');

module.exports = {
  type: 'postgres',
  host: configs.postgres.host,
  port: configs.postgres.port,
  username: configs.postgres.userName,
  password: configs.postgres.password,
  database: configs.postgres.database,
  entities: [User, UserProfile, userAdmin, Event, FeedBack, Donation, Post, Voluntery],
  synchronize: true,
  migrations: [path.join(__dirname, '../migrations/*.js')],
  cli: {
    entitiesDir: path.join(__dirname, '../models'),
    migrationsDir: path.join(__dirname, '../migrations*.js'),
  },
  extra: {
    connectionLimit: configs.postgres.maxConn,
    idleTimeoutMillis: configs.postgres.idleTimeOut,
    connectionTimeoutMillis: configs.postgres.connTimeOut,
    ssl: {
      rejectUnauthorized: false, // Disable SSL certificate validation
    },
  },
};
