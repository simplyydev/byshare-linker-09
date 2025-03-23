const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

const app = express();
app.use(cors());
app.use(express.json());

// Create storage directory if it doesn't exist
const storageDir = path.join(__dirname, 'storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Setup multer for file uploads with improved error handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const fileId = req.body.folderUploadId || uuidv4();
      const uploadDir = path.join(storageDir, fileId);
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    } catch (error) {
      cb(new Error('Échec de création du répertoire de destination'));
    }
  },
  filename: (req, file, cb) => {
    try {
      // For folder uploads, keep the relative path
      if (req.body.folderPath) {
        const relativePath = file.originalname;
        // Create subdirectories if needed
        const dirPath = path.dirname(relativePath);
        if (dirPath !== '.') {
          const fullDirPath = path.join(storageDir, req.body.folderUploadId, dirPath);
          if (!fs.existsSync(fullDirPath)) {
            fs.mkdirSync(fullDirPath, { recursive: true });
          }
        }
        cb(null, relativePath);
      } else {
        cb(null, file.originalname);
      }
    } catch (error) {
      cb(new Error('Échec de création du fichier'));
    }
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Les vérifications de type de fichier pourront être ajoutées ici
    cb(null, true);
  }
});

// In-memory database for file metadata (in a real app, use a real database)
let filesDatabase = [];
let userUploadsMap = {};

// Save database to a JSON file periodically
const saveDatabase = () => {
  try {
    const data = JSON.stringify({ 
      files: filesDatabase,
      userUploads: userUploadsMap
    });
    fs.writeFileSync(path.join(__dirname, 'database.json'), data);
  } catch (error) {
    console.error('Error saving database:', error);
  }
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

// Serve static files from the build directory
const staticDir = path.join(__dirname, '../dist');
app.use(express.static(staticDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Erreur interne du serveur' });
});

// Upload endpoint with improved error handling
app.post('/api/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Fichier trop volumineux' });
      }
      return res.status(400).json({ error: err.message || 'Erreur de téléchargement' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier téléchargé' });
      }

      const { originalname, mimetype, size } = req.file;
      const { expiryDate, password, visibility, userId, folderUploadId, folderPath, isFolder } = req.body;
      
      const fileId = folderUploadId || path.parse(path.dirname(req.file.path)).name;
      
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
        userAgent: req.get('User-Agent'),
        visibility: visibility || 'public',
        isFolder: isFolder === 'true',
        folderPath: folderPath || null,
        files: isFolder === 'true' ? [] : undefined
      };
      
      // Check if this is a folder upload (subsequent file)
      const existingFileIndex = filesDatabase.findIndex(f => f.id === fileId);
      if (existingFileIndex !== -1 && isFolder === 'true') {
        // Add to existing folder's files array
        filesDatabase[existingFileIndex].files.push({
          path: folderPath || originalname,
          name: path.basename(originalname),
          size: size,
          type: mimetype
        });
        
        // Update total size
        filesDatabase[existingFileIndex].size += size;
      } else {
        if (isFolder === 'true') {
          newFile.files = [{
            path: folderPath || originalname,
            name: path.basename(originalname),
            size: size,
            type: mimetype
          }];
        }
        filesDatabase.push(newFile);
      }
      
      // Add to user's upload history
      if (userId) {
        if (!userUploadsMap[userId]) {
          userUploadsMap[userId] = [];
        }
        
        // Check if already in user history (for folder uploads)
        const existingUploadIndex = userUploadsMap[userId].findIndex(u => u.id === fileId);
        if (existingUploadIndex === -1) {
          userUploadsMap[userId].push({
            id: fileId,
            fileName: originalname,
            fileSize: size,
            fileType: mimetype,
            uploadDate: newFile.createdAt,
            expiryDate: expiryDate || null,
            hasPassword: !!password,
            visibility: visibility || 'public',
            isFolder: isFolder === 'true'
          });
        } else if (isFolder === 'true') {
          // Update size for folder uploads
          userUploadsMap[userId][existingUploadIndex].fileSize += size;
        }
      }
      
      saveDatabase();
      
      res.status(201).json({ 
        id: fileId, 
        url: `${req.protocol}://${req.get('host')}/files/${fileId}` 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Échec du téléchargement' });
    }
  });
});

// Get user uploads with improved error handling
app.get('/api/users/:userId/uploads', (req, res) => {
  try {
    const userId = req.params.userId;
    const uploads = userUploadsMap[userId] || [];
    
    // Sort by date and return
    res.json(uploads.sort((a, b) => {
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }));
  } catch (error) {
    console.error('Error getting user uploads:', error);
    res.status(500).json({ error: 'Échec de récupération des téléchargements' });
  }
});

// Add appropriate error handling for all other routes
// Folder upload progress
app.post('/api/upload/folder/progress', (req, res) => {
  try {
    const { folderUploadId, total, current } = req.body;
    
    if (!folderUploadId) {
      return res.status(400).json({ error: 'ID de dossier requis' });
    }
    
    // In a real app, you'd store this progress in a database or cache
    // For now, we'll just return the current progress
    res.json({ 
      id: folderUploadId,
      progress: Math.round((current / total) * 100)
    });
  } catch (error) {
    console.error('Error updating folder progress:', error);
    res.status(500).json({ error: 'Échec de mise à jour de la progression' });
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
      
      // Delete physical files
      const filePath = path.join(storageDir, fileId);
      if (fs.existsSync(filePath)) {
        if (fs.lstatSync(filePath).isDirectory()) {
          fs.rmdirSync(filePath, { recursive: true });
        } else {
          fs.unlinkSync(filePath);
        }
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
  
  const filePath = path.join(storageDir, fileId);
  
  // Handle folder downloads as ZIP
  if (file.isFolder || (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory())) {
    const zipFileName = `${file.name || 'folder'}.zip`;
    const zipPath = path.join(storageDir, `${fileId}_download.zip`);
    
    // Create a zip file
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    });
    
    // Listen for all archive data to be written
    output.on('close', function() {
      res.download(zipPath, zipFileName, () => {
        // Delete the temporary zip file after download
        fs.unlinkSync(zipPath);
      });
    });
    
    // Handle errors
    archive.on('error', function(err) {
      console.error('Archive error:', err);
      res.status(500).json({ error: 'Failed to create archive' });
    });
    
    // Pipe archive data to the file
    archive.pipe(output);
    
    // Add directory contents to the archive
    archive.directory(filePath, false);
    
    // Finalize the archive
    archive.finalize();
  } else {
    // Regular file download
    const fullPath = path.join(filePath, file.name);
    res.download(fullPath, file.name);
  }
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
  
  // Delete physical file/folder
  const filePath = path.join(storageDir, fileId);
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmdirSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
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

// Add this new endpoint for password verification
app.post('/api/files/:id/verify-password', (req, res) => {
  try {
    const fileId = req.params.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }
    
    const file = filesDatabase.find(f => f.id === fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }
    
    // File has no password
    if (!file.password) {
      return res.status(400).json({ error: 'Le fichier n\'est pas protégé par mot de passe' });
    }
    
    const isValid = password === file.password;
    
    res.json({ isValid });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Erreur de vérification du mot de passe' });
  }
});

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
