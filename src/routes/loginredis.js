const express = require('express');
const router = express.Router();
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
//const bcrypt = require('bcrypt');
const User = require('./../models/user'); // Adjust the import path as needed

// Configure session storage using Redis
const redisClient = redis.createClient({
    host: 'localhost', // Redis server host
    port: 6379, // Redis server port
    // Add any additional configuration options here
  });
  
  const RedisStore = connectRedis(session);
  
  router.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: 'your-secret-key', // Change this to a secure secret key
      resave: false,
      saveUninitialized: false,
    })
  );

// Login route
router.get('/loginred', (req, res) => {
  res.render('loginredis', { error: '' });
});

router.post('/loginred', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user in the database by email
    const user = await User.findOne({ email ,password});

    if (!user) {
      return res.render('loginredis', { error: 'Invalid email or password' });
    }

    req.session.isLoggedIn = true;
    req.session.user = user;

    res.redirect('/api/users/profile');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

module.exports = router;
