const express = require('express');
const Teacher = require('../models/teacherModel'); // Assuming the Teacher model is in 'models/Teacher.js'
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser')



router.get('/' , (req,res) => {
    res.json({message : "Running the teacher router"})
})
// POST route to create a new teacher



router.post('/create-teacher', verifyUser, async (req, res) => {
  // Check role of the authenticated user
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).json({ message: 'No proper authorization' });
  }

  const { name, email, password, post, qualification, specialization, joiningDate } = req.body;

  try {
    // Check if all required fields are provided
    if (!name || !email || !password || !post || !qualification || !specialization || !joiningDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email is already registered
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // Create a new teacher
    const newTeacher = new Teacher({
      name,
      email,
      password, // Store password as is (not hashed)
      post,
      qualification,
      specialization,
      joiningDate: new Date(joiningDate) // Ensure date format
    });

    // Save the teacher to the database
    await newTeacher.save();

    // Respond with success
    return res.status(201).json({
      message: 'Teacher created successfully',
      teacher: {
        name: newTeacher.name,
        email: newTeacher.email,
        post: newTeacher.post,
        qualification: newTeacher.qualification,
        specialization: newTeacher.specialization,
        joiningDate: newTeacher.joiningDate,
        createdAt: newTeacher.createdAt,
        updatedAt: newTeacher.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/get-teachers', verifyUser, async (req, res) => {
  try {
    // Fetch all teachers from the database
    const teachers = await Teacher.find(); // This assumes you're using Mongoose to query MongoDB
    if (teachers.length === 0) {
      return res.status(404).json({ message: 'No teachers found' });
    }
    // Send back the list of teachers as a response
    return res.status(200).json({ teachers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
