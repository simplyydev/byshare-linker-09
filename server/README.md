
# ByShare Server

This is the backend server for the ByShare file sharing application. It handles file uploads, storage, and retrieval.

## Setup

1. Install dependencies:
```
npm install
```

2. Create a storage directory:
```
mkdir -p storage
```

3. Start the server:
```
npm start
```

For development with auto-reload:
```
npm run dev
```

## API Endpoints

- `POST /api/upload` - Upload a file
- `GET /api/files/:id/metadata` - Get file metadata
- `GET /api/files/:id/download` - Download a file
- `GET /api/users/:userId/uploads` - Get user upload history
- `DELETE /api/files/:id` - Delete a file
- `PUT /api/files/:id/visibility` - Update file visibility
- `PUT /api/files/:id/expiry` - Update file expiry date

## Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable.

Files are stored in the `storage` directory.
