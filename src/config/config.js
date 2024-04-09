const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    POSTGRES_USER_NAME: Joi.string().required().description('MySQL Username is required!'),
    POSTGRES_HOST: Joi.string().required().description('MySQL Host name is required!'),
    POSTGRES_PORT: Joi.number().required().description('MySQL Port is required!'),
    POSTGRES_DATABASE: Joi.string().required().description('MySQL Database name is required!'),
    POSTGRES_MAX_CONN_POOL: Joi.number().required().description('MySQL Maximum connection pool number is required!'),
    POSTGRES_IDLE_TIMEOUT: Joi.number().required().description('MySQL Idle timeout is required!'),
    POSTGRES_CONN_TIMEOUT: Joi.number().required().description('MySQL Connection timeout is required!'),
    JWT_SECRET: Joi.string().required().description('JWT secret is required'),
    MAILCHIMP_API_KEY: Joi.required().description('MAILCHIMP_API_KEY required'),
    MAILCHIMP_SERVER_PREFIX: Joi.required().description('MAILCHIMP_SERVER_PREFIX required'),
    STRIPE_API_KEY: Joi.required.description('Stripe API key required'),
    // Add more MySQL specific configuration if needed
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  secret: envVars.JWT_SECRET,
  MAILCHIMP_SERVER_PREFIX: envVars.MAILCHIMP_SERVER_PREFIX,
  MAILCHIMP_API_KEY: envVars.MAILCHIMP_API_KEY,
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  STRIPE_API_KEY: envVars.STRIPE_API_KEY,
  email: {
    smtp: true,
  },
  postgres: {
    userName: process.env.POSTGRES_USER_NAME,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DATABASE,
    idleTimeOut: process.env.POSTGRES_IDLE_TIMEOUT,
    connTimeOut: process.env.POSTGRES_CONN_TIMEOUT,
    maxConn: process.env.POSTGRES_MAX_CONN,
  },
  // Comment out or remove PostgreSQL specific configuration if no longer needed
  // jwt: { ... },
  // email: { ... },
};
