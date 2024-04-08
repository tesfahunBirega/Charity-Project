const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  stripeApiKey: process.env.STRIPE_API_KEY,
};
