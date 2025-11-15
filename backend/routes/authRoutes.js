const express = require('express');
const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel')
const Student = require('../models/studentModel')

const jwt = require('jsonwebtoken')
const bcrypt  = require('bcryptjs')
const dotenv = require('dotenv')
dotenv.config();


const router = express.Router();

let secretkey = 'secretkey'

function generateAuthToken(admin) {
  const token = jwt.sign({ 
    _id: admin._id, 
    role: admin.role 
  }, secretkey, { expiresIn: '6h' }); // Token expires in 1 hour
  return token;
}

function generateTeacherToken(teacher) {
  const token = jwt.sign(
    {
      _id: teacher._id,
      role: 'teacher', // Add the role of the teacher
    },
    secretkey,
    { expiresIn: '6h' } // Token expires in 1 hour
  );
  return token;
}

function generateStudentToken(student) {
  const token = jwt.sign(
    {
      _id: student._id,
      role: 'student', // Hardcoding the role as 'student'
    },
    secretkey,
    { expiresIn: '6h' } // Token expires in 1 hour
  );
  return token;
}

router.get('/', (req, res) => {
  res.json({ message: 'Auth  Route is running ' });
});

router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email is provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the admin by email
    const admin = await Admin.findOne({ email: email });

    // Check if the admin was found
    if (!admin) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Compare the provided password with the stored one
    if (password !== admin.password) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Generate authentication token (assuming you have a function for this)
    const token = generateAuthToken(admin);

    // Respond with success and token
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      role:"admin"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/teacher-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the teacher by email
    const teacher = await Teacher.findOne({ email: email });

    // If teacher not found, return invalid credentials
    if (!teacher) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Check if the provided password matches the stored password
    if (password !== teacher.password) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Generate the teacher JWT token
    const token = generateTeacherToken(teacher);

    // Return the success response with the token
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      role:"teacher"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/student-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the student by email
    const student = await Student.findOne({ email });

    // If the student doesn't exist, return invalid credentials
    if (!student) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Check if the provided password matches the stored password
    if (password !== student.password) { // Compare directly as password is not hashed
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Generate the student JWT token
    const token = generateStudentToken(student);

    // Return the success response with the token
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      role:"student"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Export the router
module.exports = router;
