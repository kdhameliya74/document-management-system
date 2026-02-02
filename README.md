# Document Management System

A full-stack document management system with React frontend and Node.js backend.

## Project Structure

```
document-management-system/
├── client/              # React frontend application
│   ├── src/            # Source files
│   ├── public/         # Static assets
│   └── package.json    # Client dependencies
├── server/              # Node.js backend API
│   ├── index.js        # Server entry point
│   └── package.json    # Server dependencies
└── package.json         # Root package.json for running both
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both client and server:

```bash
npm run install:all
```

Or install them separately:

```bash
# Install client dependencies
npm run install:client

# Install server dependencies
npm run install:server
```

### Running the Application

#### Run in Separate Terminals (Required)

**Terminal 1 - Start Server:**
```bash
npm run server
```

**Terminal 2 - Start Client:**
```bash
npm run client
```

Alternatively, you can run them directly from their directories:

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

## Client (Frontend)

The client is a React application built with:
- React 19
- Redux Toolkit for state management
- React Router for routing
- Tailwind CSS for styling
- Vite as the build tool

### Client Scripts

```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Server (Backend)

The server is a Node.js/Express application with:
- Express.js framework
- CORS enabled
- Environment variables support

### Server Scripts

```bash
cd server
npm run dev      # Start development server with auto-reload
npm start        # Start production server
```

### API Endpoints

- `GET /api/health` - Health check endpoint

## Environment Variables

### Server (.env)

Create a `.env` file in the `server` directory:

```
PORT=5000
NODE_ENV=development
```

## License

ISC
