const express = require('express');
const router = express.Router();
const Student = require('../models/studentModel');
const verifyUser = require('../middlewares/verifyUser')



router.get('/', (req, res) => {
  res.json({ message: 'Student Route is running ' });
});


router.post('/create-student', async (req, res) => {
  const { name, department, number, rollNumber, email, password } = req.body;

  try {
    // Check if all required fields are provided
    if (!name || !department || !number || !rollNumber || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, department, number, rollNumber, email, password) are required' });
    }

    // Validate phone number (ensure it's exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(number)) {
      return res.status(400).json({ message: 'Invalid phone number. Must be exactly 10 digits.' });
    }

    // Check if the roll number is already taken
    const existingStudentByRoll = await Student.findOne({ rollNumber });
    if (existingStudentByRoll) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }

    // Check if the email is already taken
    const existingStudentByEmail = await Student.findOne({ email });
    if (existingStudentByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new student document
    const newStudent = new Student({
      name,
      department,
      number,
      rollNumber,
      email,
      password // Consider hashing password before save in production!
    });

    // Save the student to the database
    await newStudent.save();

    // Respond with success and created student
    return res.status(201).json({
      message: 'Student created successfully',
      student: newStudent
    });

  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getAllStudents', verifyUser, async (req, res) => {
  // Check if the user is either an admin or a teacher
  if (req.admin && req.admin.role === 'admin' || req.teacher && req.teacher.role === 'teacher') {
    try {
      // Fetch all students excluding password and uploadID fields
      const students = await Student.find({}, '-password -uploadID');  // Exclude password and uploadID

      return res.status(200).json({
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching students' });
    }
  } else {
    return res.status(403).json({
      message: 'Access forbidden. You do not have permission to view this data.',
    });
  }
});


router.get('/getStudentUploads/:studentId', async (req, res) => {
  const { studentId } = req.params;  // Get student ID from the route parameters

  try {
    // Find the student by ID and populate the uploadID field with the associated StudentUpload documents
    const student = await Student.findById(studentId)
      .populate('uploadID')  // This will populate the uploadID array with the actual StudentUpload documents
      .select('-password');  // Exclude password from the result

    // If no student is found, return a 404 response
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Send the student data along with their populated uploads
    return res.status(200).json({
      message: 'Student uploads fetched successfully',
      student,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching student uploads' });
  }
});

router.get('/meStudent', verifyUser, async (req, res) => {
 
  console.log(req.admin || req.student || req.teacher)

  const studentId = req.student._id;  // Get the student ID from the middleware

  try {
    // Find the student by their ID and populate the uploadID field with the associated StudentUpload documents
    const student = await Student.findById(studentId)
      .populate('uploadID')  // Populate the uploadID field with the actual StudentUpload documents
      .select('-password');  // Exclude the password field from the result

    // If no student is found, return a 404 response
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If the student has no uploads, send an appropriate response
    if (student.uploadID.length === 0) {
      return res.status(200).json({
        message: 'No uploads found for this student',
        student: student,
      });
    }

    // Send the student data along with their populated uploads
    return res.status(200).json({
      message: 'Student uploads fetched successfully',
      student: {
        name: student.name,
        department: student.department,
        rollNumber: student.rollNumber,
        email: student.email,
        uploads: student.uploadID  // Contains the populated uploads
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching student uploads' });
  }
});


router.post('/updatepassword', verifyUser, async (req, res) => {
  try {
    // Assume req.user or req.student contains authenticated student info
    const studentId = req.student || req.student._id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    // Update password **directly without hashing**
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { password: newPassword },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/getpassword', verifyUser, async (req, res) => {
  try {
    const studentId = req.student || req.student._id;

    const student = await Student.findById(studentId).select('password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.json({ password: student.password });
  } catch (error) {
    console.error('Error fetching password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
// Export the router
module.exports = router;
