// studentModel.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  grade: String,
});

module.exports = mongoose.model('Student', studentSchema);
