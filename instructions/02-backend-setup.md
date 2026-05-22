# 02 - Backend Setup

## Overview

This guide sets up the Express.js backend API server connected to MongoDB.

## Prerequisites

- Node.js v18+ installed
- MongoDB instance available (local or cloud)
- Backend folder initialized

## Installation Steps

### 1. Install Core Dependencies

From the `backend/` directory:

```bash
npm install express dotenv mongoose cors
npm install --save-dev nodemon
```

### 2. Install Database & ORM

```bash
npm install mongodb
```

### 3. Create Basic Server Structure

Create `backend/src/server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is up and running on http://localhost:${PORT}`);
});
```

### 4. Create Database Config

Create `backend/src/config/db.js`:

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
```

### 5. Update package.json

Modify `backend/package.json` to include:

```json
{
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 6. Create .env File

Create `backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=3000
NODE_ENV=development
```

### 7. Test Server

```bash
npm run dev
```

You should see:
```
MongoDB Connected
Server is up and running on http://localhost:3000
```

## Directory Structure

After setup, your `backend/` should look like:

```
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   └── (other folders will be added later)
├── .env
├── package.json
└── node_modules/
```

## Next Steps

- [05-Authentication-Setup.md](./05-authentication-setup.md) - Add Clerk authentication
- [06-Cloudinary-Setup.md](./06-cloudinary-setup.md) - Configure image uploads
