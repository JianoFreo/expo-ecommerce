# 06 - Cloudinary Setup (Image Uploads)

## Overview

Configure Cloudinary for cloud-based product image uploads.

## Prerequisites

- Cloudinary account (create at cloudinary.com)
- Backend initialized

## Backend Setup

### 1. Install Dependencies

In `backend/`:

```bash
npm install cloudinary
npm install multer
```

### 2. Add Environment Variables

In `backend/.env`:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Create Multer Middleware

Create `backend/src/middleware/multer.middleware.js`:

```javascript
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});
```

### 4. Create Cloudinary Upload Helper

Create `backend/src/lib/cloudinary.js`:

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', public_id: filename },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
```

### 5. Product Upload Controller

In `backend/src/controllers/product.controller.js`:

```javascript
import { uploadToCloudinary } from '../lib/cloudinary.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Upload images to Cloudinary
    const images = await Promise.all(
      files.map(file => uploadToCloudinary(file.buffer, `product-${Date.now()}`))
    );

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images,
      shop: req.user.shop,
    });

    await product.save();
    res.status(201).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};
```

### 6. Update Product Route

In `backend/src/routes/product.route.js`:

```javascript
import { upload } from '../middleware/multer.middleware.js';
import { createProduct } from '../controllers/product.controller.js';

router.post('/', upload.array('images', 5), createProduct);
```

## Admin Integration

### 1. Create Product Upload Form

In `admin/src/pages/ProductsPage.jsx`:

```javascript
const handleImageChange = (e) => {
  setSelectedImages(Array.from(e.target.files));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('price', price);
  
  selectedImages.forEach(img => {
    formData.append('images', img);
  });

  try {
    const res = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setProducts([...products, res.data]);
  } catch (error) {
    console.error('Error uploading product:', error);
  }
};
```

## Mobile Integration

### 1. Install Image Picker

In `mobile/`:

```bash
npm install expo-image-picker
```

### 2. Create Image Picker Hook

Create `mobile/hooks/useImagePicker.ts`:

```typescript
import { ImagePickerAsset, launchImageLibraryAsync } from 'expo-image-picker';

export const useImagePicker = () => {
  const pickImages = async (multiple = false) => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultiple: multiple,
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets;
    }
    return [];
  };

  return { pickImages };
};
```

## Testing Upload

1. Go to Admin → Products
2. Create new product with images
3. Verify images appear on Cloudinary dashboard
4. Verify product details display correctly

## Next Steps

- [07-Stripe-Payments.md](./07-stripe-payments.md) - Payment setup
- [08-Inngest-Webhooks.md](./08-inngest-webhooks.md) - Background jobs
