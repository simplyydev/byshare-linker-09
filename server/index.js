const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Create storage directory if it doesn't exist
const storageDir = path.join(__dirname, 'storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${fileId}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// In-memory database for file metadata (in a real app, use a real database)
let filesDatabase = [];
let userUploadsMap = {};

// Save database to a JSON file periodically
const saveDatabase = () => {
  const data = JSON.stringify({ 
    files: filesDatabase,
    userUploads: userUploadsMap
  });
  fs.writeFileSync(path.join(__dirname, 'database.json'), data);
};

// Load database from file on startup
try {
  if (fs.existsSync(path.join(__dirname, 'database.json'))) {
    const data = fs.readFileSync(path.join(__dirname, 'database.json'), 'utf8');
    const parsedData = JSON.parse(data);
    filesDatabase = parsedData.files || [];
    userUploadsMap = parsedData.userUploads || {};
  }
} catch (error) {
  console.error('Error loading database:', error);
}

// CORS configuration for the storage directory
app.use('/storage', express.static(storageDir));

// Upload endpoint - Fixed the parameters order
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, filename } = req.file;
    const { expiryDate, password, visibility, userId } = req.body;
    
    const fileId = path.parse(filename).name; // Extract UUID from filename
    
    // Add file to the database
    const newFile = {
      id: fileId,
      name: originalname,
      size: size,
      type: mimetype,
      password: password || null,
      expiryDate: expiryDate || null,
      createdAt: new Date().toISOString(),
      reportCount: 0,
      reportReasons: [],
      uploadedBy: userId || req.ip,
      visibility: visibility || 'public',
      filename: filename
    };
    
    filesDatabase.push(newFile);
    
    // Add to user's upload history
    if (userId) {
      if (!userUploadsMap[userId]) {
        userUploadsMap[userId] = [];
      }
      
      userUploadsMap[userId].push({
        id: fileId,
        fileName: originalname,
        fileSize: size,
        fileType: mimetype,
        uploadDate: newFile.createdAt,
        expiryDate: expiryDate || null,
        hasPassword: !!password,
        visibility: visibility || 'public'
      });
    }
    
    saveDatabase();
    
    res.status(201).json({ 
      id: fileId, 
      url: `${req.protocol}://${req.get('host')}/files/${fileId}` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// File reporting endpoint
app.post('/api/files/:id/report', (req, res) => {
  const fileId = req.params.id;
  const { reason } = req.body;
  
  const fileIndex = filesDatabase.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Add report to file
  filesDatabase[fileIndex].reportCount += 1;
  if (reason) {
    filesDatabase[fileIndex].reportReasons.push(reason);
  }
  
  saveDatabase();
  
  res.json({ success: true });
});

// Get all files endpoint (admin)
app.get('/api/files', (req, res) => {
  res.json(filesDatabase);
});

// Get storage usage endpoint (admin)
app.get('/api/storage/usage', (req, res) => {
  let totalSize = 0;
  
  filesDatabase.forEach(file => {
    totalSize += file.size;
  });
  
  res.json({ usage: totalSize });
});

// Get file metadata
app.get('/api/files/:id/metadata', (req, res) => {
  const fileId = req.params.id;
  const file = filesDatabase.find(f => f.id === fileId);
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Check if file has expired
  if (file.expiryDate) {
    const expiryDate = new Date(file.expiryDate);
    if (expiryDate < new Date()) {
      // File has expired, delete it
      const fileIndex = filesDatabase.findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
        filesDatabase.splice(fileIndex, 1);
      }
      
      // Delete physical file
      const filePath = path.join(storageDir, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      saveDatabase();
      return res.status(404).json({ error: 'File has expired' });
    }
  }
  
  // Return metadata without password, but include hasPassword flag
  const { password, ...metadata } = file;
  res.json({
    ...metadata,
    hasPassword: !!password  // Add a boolean flag indicating if password exists
  });
});

// Download file
app.get('/api/files/:id/download', (req, res) => {
  const fileId = req.params.id;
  const password = req.query.password;
  
  const file = filesDatabase.find(f => f.id === fileId);
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Check if file has expired
  if (file.expiryDate) {
    const expiryDate = new Date(file.expiryDate);
    if (expiryDate < new Date()) {
      return res.status(404).json({ error: 'File has expired' });
    }
  }
  
  // Check password if file is password protected
  if (file.password && password !== file.password) {
    return res.status(403).json({ error: 'Incorrect password' });
  }
  
  const filePath = path.join(storageDir, file.filename);
  res.download(filePath, file.name);
});

// Get user uploads
app.get('/api/users/:userId/uploads', (req, res) => {
  const userId = req.params.userId;
  const uploads = userUploadsMap[userId] || [];
  
  // Sort by date and return
  res.json(uploads.sort((a, b) => {
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  }));
});

// Delete file
app.delete('/api/files/:id', (req, res) => {
  const fileId = req.params.id;
  const userId = req.query.userId;
  
  const fileIndex = filesDatabase.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const file = filesDatabase[fileIndex];
  
  // Delete file from database
  filesDatabase.splice(fileIndex, 1);
  
  // Delete from user history
  if (userId && userUploadsMap[userId]) {
    const userUploads = userUploadsMap[userId];
    const uploadIndex = userUploads.findIndex(u => u.id === fileId);
    
    if (uploadIndex !== -1) {
      userUploads.splice(uploadIndex, 1);
    }
  }
  
  // Delete physical file
  const filePath = path.join(storageDir, file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  saveDatabase();
  
  res.json({ success: true });
});

// Update file visibility
app.put('/api/files/:id/visibility', (req, res) => {
  const fileId = req.params.id;
  const { visibility, userId } = req.body;
  
  const fileIndex = filesDatabase.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Update in files database
  filesDatabase[fileIndex].visibility = visibility;
  
  // Update in user history
  if (userId && userUploadsMap[userId]) {
    const userUploads = userUploadsMap[userId];
    const uploadIndex = userUploads.findIndex(u => u.id === fileId);
    
    if (uploadIndex !== -1) {
      userUploads[uploadIndex].visibility = visibility;
    }
  }
  
  saveDatabase();
  
  res.json({ success: true });
});

// Update file expiry date
app.put('/api/files/:id/expiry', (req, res) => {
  const fileId = req.params.id;
  const { expiryDate, userId } = req.body;
  
  const fileIndex = filesDatabase.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Update in files database
  filesDatabase[fileIndex].expiryDate = expiryDate;
  
  // Update in user history
  if (userId && userUploadsMap[userId]) {
    const userUploads = userUploadsMap[userId];
    const uploadIndex = userUploads.findIndex(u => u.id === fileId);
    
    if (uploadIndex !== -1) {
      userUploads[uploadIndex].expiryDate = expiryDate;
    }
  }
  
  saveDatabase();
  
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
