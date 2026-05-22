# 📁 Project Structure - Admin & Seller Implementation

## Backend Changes

```
backend/
├── src/
│   ├── server.js                          [UPDATED] Added seller routes import + mount
│   ├── middleware/
│   │   └── auth.middleware.js             [UPDATED] Added sellerOnly middleware
│   ├── models/
│   │   └── user.model.js                  [UPDATED] Role enum: user/seller/super-admin
│   ├── controllers/
│   │   ├── user.controller.js             [UPDATED] Added getCurrentUserProfile + promoteToSeller
│   │   └── seller.controller.js           [NEW] 4 seller endpoints
... (truncated)
```
