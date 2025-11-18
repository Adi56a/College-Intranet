const express = require('express');
const Teacher = require('../models/teacherModel'); // Assuming the Teacher model is in 'models/Teacher.js'
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser')
const Subject = require('../models/subjectModel')
const CreateEvent = require('../models/EventModel')



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


router.post('/add-subject', verifyUser, async (req, res) => {
  try {
    // Check if role is 'teacher'
    if (!req.teacher || req.teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: Only teachers can add subjects' });
    }

    const { newSubject } = req.body;

    if (!newSubject || typeof newSubject !== 'string' || !newSubject.trim()) {
      return res.status(400).json({ message: 'Invalid or missing newSubject in body' });
    }

    // Trim subject string
    const trimmedSubject = newSubject.trim();

    // Find existing subject document or create if doesn't exist
    let subjectDoc = await Subject.findOne();
    if (!subjectDoc) {
      subjectDoc = new Subject({ subject: [trimmedSubject] });
    } else {
      // Check duplicate ignoring case
      const lowerCaseSubjects = subjectDoc.subject.map(s => s.toLowerCase());
      if (lowerCaseSubjects.includes(trimmedSubject.toLowerCase())) {
        return res.status(409).json({ message: 'Subject already exists' });
      }
      subjectDoc.subject.push(trimmedSubject);
    }

    await subjectDoc.save();

    return res.status(200).json({ message: 'Subject added successfully', subjectDoc });
  } catch (error) {
    console.error('Error in /add-subject:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/get-subjects', async (req, res) => {
  try {
    // Assuming a single document with an array of subjects
    const subjectDoc = await Subject.findOne();

    if (!subjectDoc) {
      return res.status(200).json({ subjects: [] });
    }

    return res.status(200).json({ subjects: subjectDoc.subject });
  } catch (error) {
    console.error('Error in /get-subjects:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/create-event', async (req, res) => {
  try {
    const { driveUrl, title, description } = req.body;

    // Validate required fields
    if (!driveUrl || !title) {
      return res.status(400).json({ message: 'Drive URL and Title are required.' });
    }

    // Create and save new event
    const newEvent = new CreateEvent({ driveUrl, title, description });
    await newEvent.save();

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/get-events', async (req, res) => {
  try {
    const events = await CreateEvent.find().sort({ createdAt: -1 });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
