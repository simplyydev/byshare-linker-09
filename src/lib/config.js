
// Central configuration file for the application
const config = {
  // File upload settings
  upload: {
    maxSizeMB: 100,
    acceptedFileTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'video/*',
      'audio/*'
    ]
  },
  
  // Application settings
  app: {
    maxUploadsPerDay: 5,
    adminCredentials: {
      username: 'admin',
      password: 'byshare2024'
    }
  },

  // Get/set methods to allow configuration changes
  get: function(path) {
    const parts = path.split('.');
    let current = this;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  },
  
  set: function(path, value) {
    const parts = path.split('.');
    let current = this;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
    
    // Save to localStorage for persistence
    localStorage.setItem('byshare_config', JSON.stringify({
      upload: this.upload,
      app: this.app
    }));
    
    return true;
  },
  
  // Load config from localStorage
  load: function() {
    const savedConfig = localStorage.getItem('byshare_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      this.upload = { ...this.upload, ...parsed.upload };
      this.app = { ...this.app, ...parsed.app };
    }
  }
};

// Load config from localStorage on initialization
config.load();

export default config;
