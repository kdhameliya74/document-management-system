# Document Management System - Server

Production-ready backend API with MongoDB, JWT authentication, and comprehensive security.

## 🚀 Quick Start

### 1. Setup
```bash
./setup.sh
```

Or manually:
```bash
# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Create uploads directory
mkdir uploads
```

### 2. Configure Environment
Edit `.env` and update:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Generate a secure random string
- Other settings as needed

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 4. Run Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

---

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js              # JWT verification & authorization
│   └── error.js             # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Folder.js            # Folder schema
│   ├── File.js              # File schema
│   ├── FileVersion.js       # File version schema
│   ├── ActivityLog.js       # Activity tracking
│   └── Comment.js           # Comment schema
├── routes/
│   └── auth.js              # Auth routes
├── uploads/                 # File storage (gitignored)
├── index.js                 # Server entry point
├── .env.example             # Environment template
├── DOCUMENTATION.md         # Complete documentation
├── API_TESTING.md           # API testing guide
└── package.json
```

---

## 🔒 Security Features

✅ **Password Security**
- Bcrypt hashing (12 rounds)
- Minimum 8 characters
- Never exposed in responses

✅ **JWT Authentication**
- Secure token generation
- HttpOnly cookies
- Token expiration (7 days)
- CSRF protection

✅ **Input Validation**
- Mongoose schema validation
- NoSQL injection prevention
- Email format validation
- String length limits

✅ **Rate Limiting**
- 100 requests per 15 minutes
- Prevents brute force attacks

✅ **Security Headers**
- Helmet.js integration
- XSS protection
- Clickjacking prevention

✅ **CORS**
- Whitelist client origin
- Credentials support

---

## 📊 Database Schemas

### User
- Authentication & profile
- Storage tracking
- Role-based access

### Folder
- Hierarchical structure
- Sharing & permissions
- Trash functionality

### File
- Metadata & storage
- Versioning support
- Tags & search

### FileVersion
- Version history
- Change tracking

### ActivityLog
- Audit trail
- Auto-cleanup (90 days)

### Comment
- File discussions
- Nested replies
- Mentions

See `DOCUMENTATION.md` for complete schema details.

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register user
- `POST /login` - Login user
- `GET /me` - Get current user (protected)
- `POST /logout` - Logout (protected)
- `PUT /updatedetails` - Update profile (protected)
- `PUT /updatepassword` - Change password (protected)

### Health Check
- `GET /api/health` - Server status

See `API_TESTING.md` for testing examples.

---

## 🔧 Environment Variables

Required variables (see `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/document-management-system

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Security
BCRYPT_ROUNDS=12

# CORS
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

---

## 📝 Best Practices Implemented

1. **Async/Await** - Clean error handling
2. **Middleware** - Modular request processing
3. **Error Handling** - Centralized error management
4. **Validation** - Input validation at schema level
5. **Indexing** - Optimized database queries
6. **Soft Deletes** - Trash functionality
7. **Audit Trail** - Activity logging
8. **Access Control** - Permission-based access
9. **Rate Limiting** - API protection
10. **Security Headers** - Production-ready security

---

## 🧪 Testing

Test the API:
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
```

See `API_TESTING.md` for complete testing guide.

---

## 📚 Documentation

- **DOCUMENTATION.md** - Complete schema & security guide
- **API_TESTING.md** - API endpoint testing
- **.env.example** - Environment configuration

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Run in production mode
npm start
```

---

## 🚧 Next Steps

- [ ] Implement file upload routes
- [ ] Implement folder management routes
- [ ] Add search functionality
- [ ] Implement email verification
- [ ] Add password reset
- [ ] Real-time notifications (Socket.io)
- [ ] File sharing links
- [ ] Activity feed
- [ ] Trash auto-cleanup

---

## 📦 Dependencies

**Core:**
- express - Web framework
- mongoose - MongoDB ODM
- dotenv - Environment variables

**Security:**
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- helmet - Security headers
- express-rate-limit - Rate limiting
- express-mongo-sanitize - NoSQL injection prevention
- cookie-parser - Cookie handling

**Utilities:**
- cors - Cross-origin resource sharing
- multer - File upload handling
- express-validator - Input validation

---

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

**JWT Error:**
- Check JWT_SECRET is set
- Verify token format
- Check token expiration

**CORS Error:**
- Verify CLIENT_URL in .env
- Check origin in request

---

## 📄 License

ISC
