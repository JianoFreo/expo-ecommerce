# 10 - Database Migrations & Seeding

## Overview

Setup and manage database migrations using Sequelize or MongoDB migrations to maintain schema versioning and handle data changes safely.

## Prerequisites

- Backend initialized
- Database connection working
- Development database access

## Choose Your Approach

### Option A: Sequelize (SQL Database with PostgreSQL/MySQL)

### Option B: MongoDB (NoSQL with Mongoose)

## Sequelize Migrations Setup

### 1. Install Sequelize CLI

```bash
cd backend
npm install --save-dev sequelize-cli
npx sequelize-cli init
```

This creates:
- `config/config.json` - Database configuration
- `migrations/` - Migration files directory
- `models/` - Model definitions
- `seeders/` - Seed data directory

### 2. Configure Database Connection

In `backend/config/config.json`:

```json
{
  "development": {
    "username": "root",
    "password": "password",
    "database": "ecommerce_dev",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres"
  },
  "production": {
    "username": "prod_user",
    "password": "prod_password",
    "database": "ecommerce_prod",
    "host": "prod-db-host",
    "dialect": "postgres"
  }
}
```

### 3. Link to Environment

Update `backend/src/config/database.js`:

```javascript
import { Sequelize } from 'sequelize';
import config from '../../config/config.json' assert { type: 'json' };

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    logging: false,
  }
);

export default sequelize;
```

### 4. Create Models

Create `backend/src/models/User.js`:

```javascript
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clerkId: {
      type: DataTypes.STRING,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return User;
};
```

### 5. Generate Migration

```bash
npx sequelize-cli model:generate --name User --attributes email:string,name:string,clerkId:string
```

This creates a migration file in `migrations/` directory.

### 6. Run Migration

```bash
npx sequelize-cli db:migrate
```

### 7. Create Seed File

```bash
npx sequelize-cli seed:generate --name demo-users
```

In `seeders/xxxxx-demo-users.js`:

```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@example.com',
        name: 'Admin User',
        clerkId: 'clerk_admin_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'user@example.com',
        name: 'Regular User',
        clerkId: 'clerk_user_456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
```

### 8. Seed Database

```bash
npx sequelize-cli db:seed:all
```

## MongoDB Migrations with Mongoose

### 1. Install Migration Tool

```bash
cd backend
npm install db-migrate db-migrate-mongodb
```

### 2. Setup Migration Config

Create `database.json`:

```json
{
  "dev": {
    "driver": "mongodb",
    "url": "mongodb://localhost:27017/ecommerce_dev"
  },
  "prod": {
    "driver": "mongodb",
    "url": "mongodb+srv://user:pass@cluster.mongodb.net/ecommerce"
  }
}
```

### 3. Create Migration

```bash
db-migrate create add-users-collection
```

In `migrations/xxxxx-add-users-collection.js`:

```javascript
exports.up = async function (db) {
  const collection = db.connection.collection('users');
  
  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ clerkId: 1 });

  return collection.insertMany([
    {
      email: 'admin@example.com',
      name: 'Admin User',
      clerkId: 'clerk_admin_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

exports.down = async function (db) {
  const collection = db.connection.collection('users');
  await collection.drop();
};
```

### 4. Run Migration

```bash
db-migrate up
```

## Common Migration Patterns

### Add Column

```javascript
exports.up = async function (db) {
  await db.addColumn('users', 'phone', { type: 'STRING' });
};

exports.down = async function (db) {
  await db.removeColumn('users', 'phone');
};
```

### Drop Column

```javascript
exports.up = async function (db) {
  await db.removeColumn('products', 'oldField');
};

exports.down = async function (db) {
  await db.addColumn('products', 'oldField', { type: 'STRING' });
};
```

### Create Index

```javascript
exports.up = async function (db) {
  await db.addIndex('orders', 'userId_idx', ['userId']);
};

exports.down = async function (db) {
  await db.removeIndex('orders', 'userId_idx');
};
```

## Migration Best Practices

### 1. Always Write Both `up` and `down`

```javascript
// ✓ Good
exports.up = async () => { /* migration logic */ };
exports.down = async () => { /* rollback logic */ };

// ✗ Avoid
exports.up = async () => { /* migration logic */ };
// No down function!
```

### 2. Handle Data Type Changes

```javascript
// Add new column
exports.up = async (db) => {
  await db.addColumn('users', 'newField', { type: 'STRING' });
};

// Migrate data, then remove old column
exports.up = async (db) => {
  await db.sequelize.query('UPDATE users SET newField = oldField');
  await db.removeColumn('users', 'oldField');
};
```

### 3. Test Before Production

```bash
# Test on development database
NODE_ENV=development npx sequelize-cli db:migrate

# Verify data integrity
npm run test

# Only then proceed to production
NODE_ENV=production npx sequelize-cli db:migrate
```

## Seeding Strategies

### Development Seeds

Create comprehensive test data in `seeders/dev/`:

```bash
npx sequelize-cli seed:generate --name dev-products
npx sequelize-cli seed:generate --name dev-orders
npx sequelize-cli seed:generate --name dev-reviews
```

### Production Seeds

Keep minimal in `seeders/prod/`:

```bash
npx sequelize-cli seed:generate --name prod-initial-config
```

## Automation in Package.json

```json
{
  "scripts": {
    "db:migrate": "sequelize-cli db:migrate",
    "db:migrate:undo": "sequelize-cli db:migrate:undo",
    "db:seed": "sequelize-cli db:seed:all",
    "db:reset": "sequelize-cli db:migrate:undo:all && sequelize-cli db:migrate && sequelize-cli db:seed:all",
    "db:setup": "npm run db:migrate && npm run db:seed"
  }
}
```

## Troubleshooting

### Migration Failed

```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

### Seed Data Not Loaded

```bash
# Clear all seeds
npx sequelize-cli db:seed:undo:all

# Reseed
npx sequelize-cli db:seed:all
```

## Next Steps

- [11-Authentication.md](./11-authentication.md) - User authentication
- [12-API-Documentation.md](./12-api-documentation.md) - API docs
