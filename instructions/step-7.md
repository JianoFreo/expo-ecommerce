# Step 7: Configure Cloudinary

## Overview
Cloudinary is used for image and video uploads, storage, transformations, and CDN delivery.

Since this project uploads product images from the backend, configure Cloudinary in the backend service.

## 1. Create Cloudinary credentials

After logging in to Cloudinary:
- Go to **Settings -> API Keys**
- Generate or copy your **API Key** and **API Secret**
- Go to **Home** and copy your **Cloud Name**

## 2. Add Cloudinary variables to backend `.env`

In `backend/.env`, add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 3. Install Cloudinary package in backend

```bash
cd backend
npm install cloudinary@2.8.0
```

You can also install the latest version:

```bash
npm install cloudinary
```

## 4. Create `backend/src/config/cloudinary.js`

Create a Cloudinary config file under `backend/src/config/` and add:

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

## 5. Use in backend controllers/services

Import and upload files from your controllers:

```javascript
import cloudinary from '../config/cloudinary.js';

const result = await cloudinary.uploader.upload(imagePath, {
	folder: 'expo-ecommerce/products',
});
```

## Notes
- Keep Cloudinary secrets in `backend/.env` only.
- Never expose `CLOUDINARY_API_SECRET` in admin or mobile apps.
- Cloudinary setup should be done after backend setup (Step 2).