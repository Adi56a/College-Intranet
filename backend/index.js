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
const AdminToHod = require('./models/admintohod')
const Personal = require('./models/personalModel')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
const port = 3000;


// CORS setup - allow React app origin
app.use(cors({
  origin: '*',
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

app.post('/tokencheck', verifyUser, (req, res) => {
  // If verifyUser middleware passes, token is valid
  // Return user info or success message as required
  if (req.teacher) {
    return res.json({ message: 'Token valid', role: 'teacher', user: req.teacher });
  }
  if (req.student) {
    return res.json({ message: 'Token valid', role: 'student', user: req.student });
  }
  if (req.admin) {
    return res.json({ message: 'Token valid', role: 'admin', user: req.admin });
  }
  // Should not happen if middleware works properly
  return res.status(403).json({ message: 'Role not authorized' });
});
 
app.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    const { description, notice_type } = req.body;
    const { file } = req;

    // Validation
    if (!file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Description is required' 
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Description must be at least 10 characters' 
      });
    }

    if (!notice_type) {
      return res.status(400).json({ 
        success: false,
        message: 'Notice type is required' 
      });
    }

    // Valid notice types
    const validNoticeTypes = ['general', 'attendance', 'holiday', 'exam', 'placement'];
    if (!validNoticeTypes.includes(notice_type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid notice type' 
      });
    }

    // Create new document
    const newFileEntry = new AdminToTeacher({
      description: description.trim(),
      notice_type: notice_type,
      file: {
        data: file.buffer,
        contentType: file.mimetype
      }
    });

    // Save to database
    await newFileEntry.save();

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: newFileEntry._id,
        description: newFileEntry.description,
        notice_type: newFileEntry.notice_type,
        contentType: newFileEntry.file.contentType,
        createdAt: newFileEntry.createdAt
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          message: 'File size exceeds 10MB limit' 
        });
      }
    }
    
    return res.status(500).json({ 
      success: false,
      message: error.message || 'Error uploading file' 
    });
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

    if (fileDocuments.length === 0) {
      return res.status(404).json({ message: 'No files found' });
    }

    // Prepare an array to store file metadata, data, creation date, and notice_type
    const files = fileDocuments.map(doc => ({
      description: doc.description,
      contentType: doc.file.contentType,
      fileData: doc.file.data.toString('base64'), // Encode file as base64
      createdAt: doc.createdAt,
      notice_type: doc.notice_type // Include notice_type in response
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
    const { description, subject } = req.body;  // Capture subject along with description
    const { file } = req;

    // Check if a file is provided
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if description is provided
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Check if subject is provided
    if (!subject) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    // Ensure studentId is available from the middleware (i.e., req.student._id)
    const studentId = req.student._id;
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID not found' });
    }

    // Capture the IP address from the request
    const ipAddress = req.ip || '';  // Fallback if the IP is not available

    // Create a new document in the StudentUpload collection
    const newFileEntry = new StudentUpload({
      studentId,  // Set the studentId from the middleware
      description,
      subject,  // Add the subject to the file entry
      ipAddress,  // Set the IP address
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


app.post('/admintohod', upload.single('file'), async (req, res) => {
  try {
    const { description, notice_type } = req.body;
    const { file } = req;

    // Validate required fields
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    // Validate notice_type if needed, or default handled by schema

    // Create new AdminToHod document
    const newNotice = new AdminToHod({
      description: description.trim(),
      file: {
        data: file.buffer,
        contentType: file.mimetype
      },
      notice_type: notice_type || 'general'
    });

    const savedNotice = await newNotice.save();

    return res.status(201).json({
      message: 'Admin to HOD notice uploaded successfully',
      notice: savedNotice
    });
  } catch (error) {
    console.error('Error in /admintohod:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/getadmintohod', async (req, res) => {
  try {
    const notices = await AdminToHod.find().sort({ createdAt: -1 });

    const formattedNotices = notices.map(notice => ({
      _id: notice._id,
      description: notice.description,
      notice_type: notice.notice_type,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt,
      file: {
        data: notice.file.data.toString('base64'),
        contentType: notice.file.contentType
      }
    }));

    return res.status(200).json({ notices: formattedNotices });
  } catch (error) {
    console.error('Error in /getadmintohod:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/add-personalfiles-teacher', verifyUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.teacher || !req.teacher._id) {
      return res.status(401).json({ message: 'Unauthorized: Teacher not authenticated' });
    }

    const { title } = req.body;
    const file = req.file;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const personalFile = new Personal({
      title: title.trim(),
      teacher_id: req.teacher._id,
      file: {
        data: file.buffer,
        contentType: file.mimetype
      }
    });

    const savedFile = await personalFile.save();

    return res.status(201).json({ message: 'Personal file added successfully', personalFile: savedFile });
  } catch (error) {
    console.error('Error in /add-personalfiles:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/get-personalfile-teacher', verifyUser, async (req, res) => {
  try {
    if (!req.teacher || !req.teacher._id) {
      return res.status(401).json({ message: 'Unauthorized: Teacher not authenticated' });
    }

    const personalFiles = await Personal.find({ teacher_id: req.teacher._id }).sort({ createdAt: -1 });

    // Format file data to base64 string for easier frontend handling
    const filesWithBase64 = personalFiles.map(file => ({
      _id: file._id,
      title: file.title,
      teacher_id: file.teacher_id,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      file: {
        data: file.file.data.toString('base64'),
        contentType: file.file.contentType
      }
    }));

    return res.status(200).json({ personalFiles: filesWithBase64 });
  } catch (error) {
    console.error('Error in /get-personalfile:', error);
    return res.status(500).json({ message: 'Internal server error' });
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
