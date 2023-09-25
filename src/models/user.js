const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  files: [String],
});

module.exports = mongoose.model('User', userSchema);
