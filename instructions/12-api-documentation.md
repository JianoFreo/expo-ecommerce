# 12 - API Documentation & Best Practices

## Overview

Document your APIs, implement pagination, error handling, and rate limiting for production-ready backend.

## API Documentation with Swagger/OpenAPI

### 1. Install Dependencies

```bash
cd backend
npm install swagger-ui-express swagger-jsdoc
```

### 2. Create Swagger Config

Create `backend/src/config/swagger.js`:

```javascript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'Complete e-commerce API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/**/*.js'],
};

export const specs = swaggerJsdoc(options);
```

### 3. Setup Swagger UI

In `backend/src/server.js`:

```javascript
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

### 4. Document API Endpoints

In `backend/src/routes/products.js`:

```javascript
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Retrieve a paginated list of products with optional filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post('/', requireAuth, requireRole(['admin', 'seller']), createProduct);

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         image:
 *           type: string
 *         stock:
 *           type: integer
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         image:
 *           type: string
 *         stock:
 *           type: integer
 */
```

## Pagination Implementation

### 1. Create Pagination Middleware

Create `backend/src/middleware/pagination.js`:

```javascript
export const paginate = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
  };

  next();
};
```

### 2. Use in Controllers

```javascript
import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const { skip, limit } = req.pagination;
    const { category, minPrice, maxPrice } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      data: products,
      pagination: {
        total,
        page: req.pagination.page,
        limit: req.pagination.limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};
```

## Error Handling

### 1. Custom Error Classes

Create `backend/src/utils/errors.js`:

```javascript
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}
```

### 2. Global Error Handler

Create `backend/src/middleware/errorHandler.js`:

```javascript
import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ message });
  }

  // Handle Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Operational error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Programming error
  console.error('ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 3. Apply Error Handler

In `backend/src/server.js`:

```javascript
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';

// Routes
app.use('/api/products', productsRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);
```

## Rate Limiting

### 1. Install Express Rate Limit

```bash
npm install express-rate-limit redis
npm install redis
```

### 2. Setup Rate Limiter

Create `backend/src/middleware/rateLimiter.js`:

```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

client.connect();

export const generalLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export const authLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'auth-limit:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // limit login attempts
  skipSuccessfulRequests: true,
});

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'api-limit:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
});
```

### 3. Apply Rate Limiter

```javascript
import { generalLimiter, authLimiter, apiLimiter } from './middleware/rateLimiter.js';

// Apply to all requests
app.use(generalLimiter);

// Apply to auth routes
app.use('/api/auth', authLimiter);

// Apply to API routes
app.use('/api/products', apiLimiter);
```

## Request Validation

### 1. Install Joi

```bash
npm install joi
```

### 2. Create Validation Schemas

Create `backend/src/validators/productValidator.js`:

```javascript
import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(1000),
  price: Joi.number().required().positive(),
  category: Joi.string().required(),
  image: Joi.string().uri(),
  stock: Joi.number().default(0).min(0),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(1000),
  price: Joi.number().positive(),
  category: Joi.string(),
  image: Joi.string().uri(),
  stock: Joi.number().min(0),
}).min(1);
```

### 3. Create Validation Middleware

Create `backend/src/middleware/validator.js`:

```javascript
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({ errors });
    }

    req.validatedData = value;
    next();
  };
};
```

### 4. Use in Routes

```javascript
import { validate } from '../middleware/validator.js';
import { createProductSchema } from '../validators/productValidator.js';
import { createProduct } from '../controllers/productController.js';

router.post(
  '/',
  requireAuth,
  requireRole(['admin', 'seller']),
  validate(createProductSchema),
  createProduct
);
```

## Response Format

### Standardized Responses

```javascript
// Success response
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error response
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}

// Paginated response
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## CORS Configuration

In `backend/src/server.js`:

```javascript
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173', // Admin dashboard
  'http://localhost:8081', // Mobile app
  'https://example.com',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## API Versioning

Structure routes with version:

```
/api/v1/products
/api/v1/orders
/api/v2/products (new version)
```

In `backend/src/server.js`:

```javascript
import v1Router from './routes/v1/index.js';
import v2Router from './routes/v2/index.js';

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
```

## Logging

```bash
npm install winston
```

Create `backend/src/config/logger.js`:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

## Testing Endpoints

```bash
# Get all products
curl http://localhost:3000/api/v1/products

# Get products with pagination
curl "http://localhost:3000/api/v1/products?page=1&limit=5"

# Create product (authenticated)
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product", 
    "price": 99.99,
    "category": "Electronics"
  }'
```

## Next Steps

- [13-Testing.md](./13-testing.md) - API testing
- [14-Deployment.md](./14-deployment.md) - Production deployment
