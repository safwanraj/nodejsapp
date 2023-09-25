// app.js
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./../models/studentModel');

const app = express();
// app.js (continued)

// Create a new student

app.get('/new', (req, res) => {
    res.render('new', { error: '' });
  });
app.post('/students', async (req, res) => {
    const { name, age, grade } = req.body;
    const student = new Student({ name, age, grade });
  
    try {
      await student.save();
      res.redirect('/api/crud/students');
    } catch (err) {
      console.error(err);
      res.render('error', { error: 'Could not create student.' });
    }
  });
  
  // Read all students
  app.get('/students', async (req, res) => {
    try {
      const students = await Student.find();
      res.render('students', { students });
    } catch (err) {
      console.error(err);
      res.render('error', { error: 'Could not fetch students.' });
    }
  });
  

  app.get('/students/:id/edit', async (req, res) => {
    const studentId = req.params.id;
  
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.render('error', { error: 'Student not found.' });
      }
  
      res.render('edit', { student });
    } catch (err) {
      console.error(err);
      res.render('error', { error: 'Could not fetch student for editing.' });
    }
  });
  // Update a student
  app.put('/students/:id', async (req, res) => {
    const { name, age, grade } = req.body;
    const studentId = req.params.id;
  
    try {
      await Student.findByIdAndUpdate(studentId, { name, age, grade });
      res.redirect('/api/crud/students');
    } catch (err) {
      console.error(err);
      res.render('error', { error: 'Could not update student.' });
    }
  });
  
  // Delete a student
  app.delete('/students/:id', async (req, res) => {
    const studentId = req.params.id;
  
    try {
      await Student.findByIdAndRemove(studentId);
      res.redirect('/api/crud/students');
    } catch (err) {
      console.error(err);
      res.render('error', { error: 'Could not delete student.' });
    }
  });
module.exports= app;  
