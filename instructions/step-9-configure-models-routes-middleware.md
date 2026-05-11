# Step 9: Configure Models, Routes, and Admin Middleware

## Overview

This step configures the backend database models, authentication middleware, and admin API routes. We use Clerk authentication (not JWT) to protect routes. Admin users are identified by comparing their email with the `ADMIN_EMAIL` environment variable. We use Multer to handle multipart file uploads and Cloudinary for storing product images.

## Prerequisites

- Completed [Step 5: Configure Clerk Auth](step-5-configure-clerk-auth.md)
- Completed [Step 7: Configure Cloudinary Uploads](step-7-configure-cloudinary-uploads.md)
- Completed [Step 8: Connect Clerk and Inngest Sync](step-8-connect-clerk-and-inngest-sync.md)
- Backend dependencies installed (express, mongoose, nodemon)

## 1. Install Additional Packages

Install Multer for file upload handling from the `backend/` folder:

```bash
cd backend
npm install multer
```

## 2. Database Models

The codebase already has these models in `backend/src/models/`:

### User Model (`user.model.js`)
Stores users synced from Clerk with addresses array:

```javascript
const addressSchema = new mongoose.Schema({
    label: { type: String, required: true },       // "Home", "Work", etc.
    fullName: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    imageURL: { type: String, default: '' },
    clerkId: { type: String, required: true, unique: true },
    addresses: [addressSchema],    // User can have multiple addresses
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
```

### Product Model (`products.model.js`)
Stores product information with multiple images:

```javascript
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },   // Primary image
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    images: [{ type: String, required: true }],    // Array of Cloudinary URLs
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
```

### Additional Models
- `cart.model.js` - Shopping cart items
- `order.model.js` - Purchase orders
- `review.model.js` - Product reviews

## 3. Authentication Middleware

File: `backend/src/middleware/auth.middleware.js`

### `protectRoute` Middleware
Ensures user is authenticated with Clerk AND exists in the database:

```javascript
import { requireAuth } from "@clerk/clerk-sdk-node";
import { User } from "../models/user.model.js";

export const protectRoute = [
    requireAuth(),  // First: Verify Clerk authentication
    async (req, res, next) => {
        try {
            const clerkId = req.auth.userId;
            if (!clerkId) {
                return res.status(401).json({ message: "Unauthorized - invalid token" });
            }

            // Second: Check if user exists in our database
            const user = await User.findOne({ clerkId });
            if (!user) {
                return res.status(404).json({ message: "User not found in database" });
            }

            req.user = user;  // Attach user to request for downstream handlers
            next();
        } catch (error) {
            console.error("Error in protectRoute:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
];
```

### `adminOnly` Middleware
Restricts route access to admin users only (must be used AFTER `protectRoute`):

```javascript
import { ENV } from "../config/env.config.js";

export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check if user's email matches admin email from env
    if (req.user.email !== ENV.ADMIN_EMAIL) {
        return res.status(403).json({ message: "Forbidden - admin access only" });
    }
    
    next();  // User is authenticated and is an admin
};
```

**Important:** Add this to `backend/.env`:
```env
ADMIN_EMAIL=your-admin-email@example.com
```

## 4. File Upload Middleware

File: `backend/src/middleware/multer.middleware.js`

Configures multer storage, file validation, and size limits:

```javascript
import multer from 'multer';
import path from "path";

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-originalname
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Only allow image file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extname && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Only image files allowed: jpeg, jpg, png, webp"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max file size
});
```

## 5. Admin Routes

File: `backend/src/routes/admin.route.js`

Defines routes for admin product management:

```javascript
import { Router } from "express";
import { 
    createProduct, 
    getAllProducts, 
    updateProduct 
} from "../controllers/admin.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Apply authentication to all routes
router.use(protectRoute, adminOnly);

// Create product (upload up to 3 images)
router.post("/products", upload.array("images", 3), createProduct);

// Get all products
router.get("/products", getAllProducts);

// Update product (upload up to 3 images)
router.put("/products/:id", upload.array("images", 3), updateProduct);

export default router;
```

## 6. Admin Controllers

File: `backend/src/controllers/admin.controller.js`

Handles business logic for admin operations:

```javascript
import cloudinary from '../config/cloudinary.js';
import { Product } from '../models/products.model.js';

export async function createProduct(req, res) {
    try {
        const { name, description, price, stock, category } = req.body;

        // Validate required fields
        if (!name || !description || !price || !stock || !category) {
            return res.status(400).json({ message: "All fields required" });
        }

        // Validate images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image required" });
        }
        if (req.files.length > 3) {
            return res.status(400).json({ message: "Max 3 images allowed" });
        }

        // Upload images to Cloudinary
        const uploadPromises = req.files.map((file) =>
            cloudinary.uploader.upload(file.path, { folder: "products" })
        );
        const uploadResults = await Promise.all(uploadPromises);
        const imageUrls = uploadResults.map((result) => result.secure_url);

        // Create product with Cloudinary URLs
        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            imageUrl: imageUrls[0],      // Primary image
            images: imageUrls,           // All images
        });

        res.status(201).json({ message: "Product created", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getAllProducts(req, res) {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { name, description, price, stock, category },
            { new: true }
        );

        res.status(200).json({ message: "Product updated", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
```

## 7. Mount Routes in Server

Update `backend/src/server.js` to include admin routes:

```javascript
import express from 'express';
import path from 'path';
import { ENV } from './config/env.config.js';
import { connectDB } from './config/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './config/inngest.js';

import adminRoutes from './routes/admin.route.js';

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(clerkMiddleware());
app.use("/api/inngest", serve({ client: inngest, functions }));

// Mount admin routes (all protected with protectRoute + adminOnly)
app.use("/api/admin", adminRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy' });
});

if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../admin/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../admin/dist", "index.html"));
    });
}

const startServer = async () => {
    await connectDB();
    app.listen(ENV.PORT, () => {
        console.log("Server running on port", ENV.PORT);
    });
};

startServer();
```

## 8. Environment Configuration

Ensure `backend/.env` includes:

```env
MONGO_URI=<your-mongodb-connection-string>
CLERK_SECRET_KEY=<your-clerk-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
ADMIN_EMAIL=your-admin-email@example.com
INNGEST_EVENT_KEY=<your-inngest-key>
INNGEST_SIGNING_KEY=<your-inngest-signing-key>
PORT=3000
NODE_ENV=development
```

## 9. Testing Admin Routes

Use Postman, Insomnia, or VS Code REST Client:

### Create Product (Admin Only)
```
POST http://localhost:3000/api/admin/products
Content-Type: multipart/form-data

Body:
- name: "Laptop"
- description: "High performance laptop"
- price: 1299.99
- stock: 10
- category: "Electronics"
- images: [file1.jpg, file2.jpg, file3.jpg]

Headers:
- Authorization: Bearer <clerk-session-token>
```

### Get All Products (Public)
```
GET http://localhost:3000/api/admin/products
```

### Update Product (Admin Only)
```
PUT http://localhost:3000/api/admin/products/:productId
Content-Type: application/json

{
  "name": "Updated Laptop",
  "price": 1199.99,
  "stock": 5
}

Headers:
- Authorization: Bearer <clerk-session-token>
```

## Key Concepts

- **`protectRoute`**: Uses Clerk to authenticate, then verifies user exists in database
- **`adminOnly`**: Checks if `req.user.email` matches `ADMIN_EMAIL` env variable
- **Middleware Order**: Always use `protectRoute` before `adminOnly`
- **Multer**: Saves files temporarily, then upload to Cloudinary in controller
- **Cloudinary URLs**: Store `secure_url` returned from upload, not local file paths
- **File Limits**: Max 5MB per file, 3 files per request (configured in multer middleware)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Admin access only" error | Check that your user's email matches `ADMIN_EMAIL` in `.env` |
| File upload errors | Ensure multer is installed and file is < 5MB in allowed format |
| User not found in database | User must sign up through Clerk first (triggers Inngest sync to MongoDB) |
| Cloudinary upload fails | Verify `CLOUDINARY_*` env vars are correct in `.env` |