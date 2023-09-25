const express = require('express');
const router = express.Router();
const User = require('../models/user');

module.exports = (upload) => {
  // Register a new user
  router.post('/register', upload.array('files'), async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const files = req.files.map((file) => file.filename);

      const user = new User({
        name,
        email,
        password,
        files,
      });

      await user.save();

      res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
