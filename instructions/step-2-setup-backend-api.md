# Step 2: Set up the Backend

## Overview
This step installs and configures the backend application with Express, dotenv, nodemon, and database drivers for development.

## Prerequisites
- Ensure you're in the `backend/` directory
- Node.js and npm are installed

## Steps

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Initialize package.json
```bash
npm init -y
```

This creates a `package.json` file for the backend project.

### 3. Install core dependencies
```bash
npm install express dotenv
```

**What these do:**
- **express** (`^5.2.1`): Web framework for building RESTful APIs and handling HTTP requests
- **dotenv** (`^17.4.2`): Loads environment variables from `.env` file (for sensitive data like DB credentials)

### 4. Install database dependencies (Optional - only if using MongoDB)
```bash
npm install mongoose mongodb
```

**When to install:**
- Use this if your backend needs to connect to MongoDB
- **mongoose** (`^8.19.3`): ODM (Object Data Modeling) library for MongoDB - makes database operations easier
- **mongodb** (`latest`): Native MongoDB driver - used by Mongoose under the hood

**Example: If using MongoDB**
```bash
npm install mongoose mongodb
```

### 5. Install development dependencies
```bash
npm install --save-dev nodemon
```

**What this does:**
- **nodemon** (`^3.1.14`): Automatically restarts the server when you make code changes (development only, not in production)

## Verify Setup
After installation, your `backend/package.json` should look like:

**Basic setup (without database):**
```json
{
  "dependencies": {
    "express": "^5.2.1",
    "dotenv": "^17.4.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

**With MongoDB:**
```json
{
  "dependencies": {
    "express": "^5.2.1",
    "dotenv": "^17.4.2",
    "mongoose": "^8.19.3",
    "mongodb": "^6.x.x"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

## Additional Useful Dependencies (Optional)

Install these later as needed:

```bash
# For API documentation and testing
npm install cors helmet

# For validation and parsing
npm install joi express-validator

# For authentication
npm install jsonwebtoken bcryptjs
```

## Common Installation Commands

| What You Need | Command |
|---|---|
| Just basic Express API | `npm install express dotenv` |
| Express + MongoDB | `npm install express dotenv mongoose mongodb` |
| Express + PostgreSQL | `npm install express dotenv pg sequelize` |
| Express + Environment variables | `npm install dotenv` |
| Add file uploads | `npm install multer` |
| Add database ORM | `npm install sequelize` (PostgreSQL) or `npm install mongoose` (MongoDB) |

## Starting the Backend

Once setup is complete:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## What's Next?
Proceed to [Step 3: Set up the Admin](step-3.md) to initialize the admin panel.
