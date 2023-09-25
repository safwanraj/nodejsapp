const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import JWT
const User = require('./../models/user');// Adjust the import path as needed

// Login route
router.get('/login', (req, res) => {
  res.render('loginjwt', { error: '' });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user in the database by email
    const user = await User.findOne({ email,password });

    if (!user) {
      return res.render('loginjwt', { error: 'Invalid email or password' });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
      expiresIn: '1h', // Adjust token expiration as needed
    });

    // Set the token as a cookie (optional)
    res.cookie('token', token);

    // Redirect to the dashboard with the token
    res.redirect(`/api/users/dashboard?token=${token}`);
    console.log(token);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});


  

module.exports = router;
