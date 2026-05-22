# 15 - Architecture & System Design

## Project Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Client Applications                 │
├───────────────────┬───────────────────┬─────────────┤
│  Admin Dashboard  │    Mobile App     │   Web (PWA) │
│  (React + Vite)   │  (Expo + React)   │   (Future)  │
└─────────┬─────────┴────────┬──────────┴────┬────────┘
          │                   │               │
          └───────────────────┼───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   API Gateway      │
                    │  (CORS, Auth)      │
                    └─────────┬──────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼────┐        ┌─────▼────┐       ┌─────▼────┐
    │  Users   │        │Products  │       │ Orders   │
    │ Service  │        │ Service  │       │ Service  │
    └─────┬────┘        └─────┬────┘       └─────┬────┘
          │                   │                   │
    ┌─────┴───────────────────┴───────────────────┘
    │
    ├── JWT Authentication (Clerk)
    ├── Role-Based Access Control
    ├── Input Validation & Sanitization
    ├── Rate Limiting
    ├── Error Handling
    ├── Logging & Monitoring
    │
    ▼
┌─────────────────────────────────────┐
│        Data Layer (Database)        │
├──────────────────┬──────────────────┤
│  PostgreSQL/     │    MongoDB       │
│  MySQL           │    Atlas         │
└──────────────────┴──────────────────┘
    │
    ├── Migrations
    ├── Indexes
    ├── Backups
    │
    ▼
┌─────────────────────────────────────┐
│   External Services Integration     │
├──────────────────┬──────────────────┤
│ Clerk Auth       │ Inngest          │
│ Cloudinary CDN   │ Stripe Payment   │
│ Sentry Monitor   │ SendGrid Email   │
└──────────────────┴──────────────────┘
```

## Backend Architecture (MVC Pattern)

### Folder Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js
│   │   ├── swagger.js
│   │   └── env.js
│   │
│   ├── models/           # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   │
│   ├── controllers/      # Business logic
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── __tests__/
│   │
│   ├── routes/           # API endpoints
│   │   ├── v1/
│   │   │   ├── users.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── validator.js
│   │   └── pagination.js
│   │
│   ├── services/         # Business logic layer
│   │   ├── userService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   └── paymentService.js
│   │
│   ├── utils/            # Utility functions
│   │   ├── errors.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── seeds/            # Database seeds
│   │   ├── users.seed.js
│   │   └── products.seed.js
│   │
│   ├── migrations/       # Database migrations
│   │   ├── 001-create-users.js
│   │   └── 002-create-products.js
│   │
│   └── server.js         # Entry point
│
├── .env                  # Environment variables
├── package.json
└── README.md
```

### Design Patterns Used

#### 1. MVC Pattern
```
Controller → Service → Model → Database
   ↑                               ↓
   └───────────── Response ────────┘
```

#### 2. Service Layer Pattern
```javascript
// Controllers call services
// Services contain business logic
// Services call models

export const createOrder = async (req, res) => {
  try {
    const order = await orderService.create(req.validatedData);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### 3. Repository Pattern
```javascript
// Abstract database queries
export const userRepository = {
  findById: (id) => User.findById(id),
  create: (data) => User.create(data),
  update: (id, data) => User.findByIdAndUpdate(id, data),
  delete: (id) => User.findByIdAndDelete(id),
};
```

## Frontend Architecture

### Admin Dashboard Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── PageLoader.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Card.jsx
│   │   └── features/
│   │       ├── products/
│   │       ├── orders/
│   │       └── customers/
│   │
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── OrdersPage.jsx
│   │   └── LoginPage.jsx
│   │
│   ├── layouts/
│   │   ├── DashboardLayout.jsx
│   │   └── AuthLayout.jsx
│   │
│   ├── lib/
│   │   ├── api.js          # API service
│   │   ├── axios.js        # Axios instance
│   │   └── utils.js        # Helper functions
│   │
│   ├── hooks/
│   │   ├── useProducts.js
│   │   ├── useOrders.js
│   │   └── useFetch.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

### State Management Pattern

```javascript
// Using React Context + Hooks (No Redux needed for this scale)

// Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    const user = await authService.login(credentials);
    setUser(user);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => useContext(AuthContext);

// Usage
const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  // ...
};
```

## Mobile App Architecture

### React Native + Expo Structure

```
mobile/
├── app/
│   ├── _layout.tsx         # Root navigator
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── shop.tsx
│   │   ├── cart.tsx
│   │   └── profile.tsx
│   ├── product/
│   │   └── [id].tsx        # Dynamic routes
│   └── orders/
│       └── [id].tsx
│
├── components/
│   ├── ProductCard.tsx
│   ├── AddressCard.tsx
│   ├── OrderSummary.tsx
│   └── common/
│       ├── SafeScreen.tsx
│       ├── LoadingState.tsx
│       └── ErrorState.tsx
│
├── hooks/
│   ├── useProducts.ts
│   ├── useCart.ts
│   ├── useOrders.ts
│   └── useSocialAuth.ts
│
├── lib/
│   ├── api.ts
│   └── utils.ts
│
├── types/
│   └── index.ts
│
└── tailwind.config.js
```

## Data Flow & State Management

### User Authentication Flow

```
┌─────────────────┐
│  User enters    │
│  credentials    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Client sends login request  │
│ /api/auth/login             │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Backend validates Clerk JWT │
│ Queries user from database  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Generate session/JWT token  │
│ Return user + token         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Client stores token         │
│ (localStorage/SecureStore)  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Redirect to dashboard       │
│ Include token in headers    │
│ for subsequent requests     │
└─────────────────────────────┘
```

### Product Listing Flow

```
┌────────────────────┐
│ User navigates to  │
│ products page      │
└────────┬───────────┘
         │
         ▼
┌──────────────────────────────┐
│ Check cache (localStorage)   │
│ If valid, show cached data   │
└────────┬─────────────────────┘
         │
         ▼ (if not cached)
┌──────────────────────────────┐
│ Show loading skeleton         │
│ Fetch from /api/products     │
│ with pagination params       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend queries database     │
│ Applies filters & pagination │
│ Returns products + metadata  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Client caches response       │
│ Renders product list         │
│ Shows pagination controls    │
└──────────────────────────────┘
```

## API Design Principles

### RESTful Conventions

```
GET    /api/v1/products              # List all
GET    /api/v1/products?page=1       # With pagination
GET    /api/v1/products/:id          # Get one
POST   /api/v1/products              # Create
PUT    /api/v1/products/:id          # Full update
PATCH  /api/v1/products/:id          # Partial update
DELETE /api/v1/products/:id          # Delete
```

### Response Standards

```javascript
// Success Response
{
  "status": "success",
  "data": { /* resource */ },
  "message": "Operation completed"
}

// Paginated Response
{
  "status": "success",
  "data": [ /* array of resources */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}

// Error Response
{
  "status": "error",
  "message": "What went wrong",
  "errors": [
    { "field": "email", "message": "Invalid format" }
  ]
}
```

## Performance Optimization

### 1. Database Level
- Indexes on frequently queried fields
- Query optimization and pagination
- Connection pooling

### 2. API Level
- Caching with Redis
- Response compression (gzip)
- Lazy loading endpoints

### 3. Frontend Level
- Code splitting
- Image optimization
- Lazy component loading
- Memoization

### 4. Infrastructure
- CDN for static assets
- Load balancing
- Database replication

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│           HTTPS/SSL/TLS Encryption                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│        CORS & Request Validation                    │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│     Authentication (Clerk JWT Tokens)               │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│    Authorization (Role-Based Access Control)        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│   Input Validation & Sanitization                   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│      Rate Limiting & DDoS Protection                │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│    Database Encryption & Access Control            │
└─────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Load balancing with nginx
- Multiple API instances
- Stateless architecture

### Vertical Scaling
- Database optimization
- Memory management
- Query caching

### Database Scaling
- Read replicas
- Sharding strategy
- Archive old data

## Monitoring & Observability

### Key Metrics to Track
- API response times
- Error rates
- Database query times
- User engagement
- System resource usage

### Tools
- Sentry: Error tracking
- Datadog: Infrastructure monitoring
- LogRocket: Frontend monitoring
- New Relic: Full-stack APM

## Design Principles

### SOLID Principles
- **S**ingle Responsibility: Each module has one job
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Derived classes should be substitutable
- **I**nterface Segregation: Many client-specific interfaces
- **D**ependency Inversion: Depend on abstractions, not concrete classes

### DRY (Don't Repeat Yourself)
- Reusable utility functions
- Shared components
- Common services

### KISS (Keep It Simple, Stupid)
- Clear, readable code
- Avoid over-engineering
- Document complex logic

## Next Steps

- Implement additional services
- Add real-time features (WebSockets)
- Implement search functionality
- Add recommendation engine
- Setup analytics pipeline
