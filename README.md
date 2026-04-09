# Document Management System

A full-stack Document Management System (DMS) built with React.js, Node.js, and MongoDB. This system provides a robust platform for managing files and folders, facilitating seamless collaboration through document sharing, and tracking document-related activities. AI-powered document summarization and tagging.

## Features & Screenshots

- **Authentication System:** Secure user registration, login, and error handling.
- **Nested Folder Strategy:** Create folders within folders to organize documents efficiently.
- **File Upload & Management:** Upload multiple files with an intuitive UI and manage them seamlessly inside folders.
- **Document Actions & Sharing:** Share files with other users, view shared documents, and perform various actions like renaming or moving between folders.
- **Global Search & Filters:** Find your documents instantly across all folders using detailed search and advanced table filters.
- **Real-Time Activity Tracking:** Track modifications, uploads, and other activities related to your documents.
- **Trash Management:** Safely move items to trash and restore them if needed.

### Authentication
<div align="center">
  <img src="docs/Signup%20Screen.png" alt="Signup Screen" width="45%" />
  <img src="docs/Signup%20Process.png" alt="Signup Process" width="45%" />
  <br />
  <img src="docs/Login%20Screen.png" alt="Login Screen" width="45%" />
  <img src="docs/Invalid%20Login.png" alt="Invalid Login" width="45%" />
</div>

### Dashboard & File Organization
<div align="center">
  <img src="docs/HomePage.png" alt="HomePage" width="45%" />
  <img src="docs/Home(Root)%20Directory.png" alt="Home Directory" width="45%" />
  <br />
  <img src="docs/Folder%20Creation.png" alt="Folder Creation" width="45%" />
  <img src="docs/Moving%20to%20another%20folder.png" alt="Moving to another folder" width="45%" />
</div>

### File Uploading
<div align="center">
  <img src="docs/File%20Uploading.png" alt="File Uploading" width="45%" />
  <img src="docs/Files%20uploading.png" alt="Files uploading" width="45%" />
</div>

### Document Actions & Sharing
<div align="center">
  <img src="docs/Document%20Action%20Menu.png" alt="Document Action Menu" width="45%" />
  <img src="docs/Sharing.png" alt="Sharing" width="45%" />
  <br />
  <img src="docs/shared%20documents.png" alt="Shared Documents" width="45%" />
  <img src="docs/Document%20Activity.png" alt="Document Activity" width="45%" />
</div>

### Search, Filters & Trash
<div align="center">
  <img src="docs/Global%20search.png" alt="Global search" width="45%" />
  <img src="docs/Document%20With%20Filter.png" alt="Document With Filter" width="45%" />
  <br />
  <img src="docs/Trashed%20Documents.png" alt="Trashed Documents" width="45%" />
</div>

### AI Features
<div align="center">
  <img src="AI-Summary-Tags.png" alt="AI Summary Tags" width="45%" />
</div>

## Technologies Used

**Frontend:**
- React 19 (Vite)
- Redux Toolkit (State Management)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Socket.IO Client (Real-time events)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- AWS S3 (File Storage)
- Redis & Socket.IO (Event broadcasting, real-time updates)
- JWT & bcryptjs (Authentication)

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local setup or MongoDB Atlas instance
- **Redis**: Local setup or remote cluster
- **AWS S3**: Active AWS account with an S3 Bucket provisioned

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd document-management-system
   ```

2. **Install dependencies for both client and server**
   ```bash
   npm run install:all
   ```
   *Note: If you prefer, you can install them separately using `npm run install:client` and `npm run install:server`.*

3. **Environment Setup**

   **Server:** Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET_NAME=your_bucket_name
   REDIS_URL=your_redis_url
   GEMINI_API_KEY=your_gemini_api_key
   ```

   **Client:** Ensure your client `.env` file (`client/.env`) is correctly configured:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

You need to run both the client and server development setups concurrently. 

**Terminal 1 - Start Server:**
```bash
npm run server
```

**Terminal 2 - Start Client:**
```bash
npm run client
```

*The client will be running on `http://localhost:5173` and the server on `http://localhost:5000`.*

## License
ISC
