const express = require('express');
const cors = require('cors');  // Add cors package
const connectDB = require('./config/db');
const multer  = require('multer')
const testRoute = require('./routes/testRoute');
const adminRoute = require('./routes/adminRoutes');
const authRoute = require('./routes/authRoutes');
const teacherRoute = require('./routes/teacherRoutes');
const studentRoute = require('./routes/studentRoutes');
const AdminToTeacher = require('./models/admintoteacherModel')
const StudentUpload = require('./models/studentUploads')
const verifyUser  = require('./middlewares/verifyUser')
const Student = require('./models/studentModel')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
const port = 3000;


// CORS setup - allow React app origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,  // if your frontend uses credentials/cookies
}));

app.use(express.json());

app.use('/api/users', testRoute);
app.use('/api/admin', adminRoute);
app.use('/api/teacher', teacherRoute);
app.use('/api/auth', authRoute);
app.use('/api/student', studentRoute);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    const { description } = req.body;
    const { file } = req;

    // Check if a file is provided
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if description is provided
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Create a new document in the AdminToTeacher collection
    const newFileEntry = new AdminToTeacher({
      description,
      file: {
        data: file.buffer,  // File data as binary buffer
        contentType: file.mimetype,  // The MIME type (e.g., 'application/pdf')
      }
    });

    // Save the document to MongoDB
    await newFileEntry.save();

    return res.status(200).json({
      message: 'File uploaded successfully',
      file: newFileEntry,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
});

app.get('/get-file/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the file document by ID
    const fileDocument = await AdminToTeacher.findById(id);

    if (!fileDocument) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set the appropriate content type
    res.setHeader('Content-Type', fileDocument.file.contentType);
    res.send(fileDocument.file.data);  // Send the file data

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving file' });
  }
});


app.get('/get-admintoteacher', async (req, res) => {
  try {
    // Find all documents in the AdminToTeacher collection
    const fileDocuments = await AdminToTeacher.find();

    // If no documents are found
    if (fileDocuments.length === 0) {
      return res.status(404).json({ message: 'No files found' });
    }

    // Prepare an array to store file metadata, data, and the creation date
    const files = fileDocuments.map(doc => ({
      description: doc.description,
      contentType: doc.file.contentType,
      fileData: doc.file.data.toString('base64'), // Encode file as base64 for sending in response
      createdAt: doc.createdAt, // Include the creation date
    }));

    // Send the array of file metadata and data
    return res.status(200).json({
      message: 'Files retrieved successfully',
      files,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving files' });
  }
});



app.post('/student-upload', verifyUser, upload.single('file'), async (req, res) => {
  console.log(req.student._id);
  try {
    const { description } = req.body;
    const { file } = req;

    // Check if a file is provided
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if description is provided
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Ensure studentId is available from the middleware (i.e., req.student._id)
    const studentId = req.student._id;
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID not found' });
    }

    // Create a new document in the StudentUpload collection
    const newFileEntry = new StudentUpload({
      studentId,  // Set the studentId from the middleware
      description,
      file: {
        data: file.buffer,  // File data as binary buffer
        contentType: file.mimetype,  // The MIME type (e.g., 'application/pdf')
      }
    });

    // Save the document to MongoDB
    const savedFile = await newFileEntry.save();

    // After the file is saved, update the student's uploadID (push new uploadId into the array)
    await Student.findByIdAndUpdate(studentId, {
      $push: { uploadID: savedFile._id }  // Use $push to add the new file's ObjectId to the uploadID array
    });

    return res.status(200).json({
      message: 'File uploaded successfully',
      file: savedFile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
});


connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  });
