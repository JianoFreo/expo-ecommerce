# Development Patterns & Best Practices

## Daily Development Workflow

### Morning Standup
1. Review the current task list
2. Check for overnight errors in monitoring (Sentry)
3. Review pull requests
4. Plan the day's work

### Development Session
1. Create feature branch: `git checkout -b feature/feature-name`
2. Write tests first (TDD approach)
3. Implement feature
4. Test locally
5. Commit with descriptive message
6. Push to GitHub
7. Create pull request
8. Address review comments

### Code Review Checklist
- [ ] Code follows style guide
- [ ] Tests included and passing
- [ ] No console errors/warnings
- [ ] No hardcoded values
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Performance acceptable
- [ ] Security reviewed

---

## Common Code Patterns

### API Error Handling

```javascript
// ✓ Good
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error); // Pass to error handler
  }
};

// ✗ Avoid
export const getUser = (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) console.log(err); // Poor error handling
    res.json(user); // May be undefined
  });
};
```

### React Component Patterns

```javascript
// ✓ Good - Functional component with hooks
export const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <div>{user.name}</div>;
};

// ✗ Avoid - Class component, memory leaks
class UserProfile extends Component {
  state = { user: null };
  
  componentDidMount() {
    fetch('/api/user').then(res => res.json()).then(user => {
      this.setState({ user }); // Memory leak if component unmounts
    });
  }

  render() {
    return <div>{this.state.user?.name}</div>;
  }
}
```

### Database Query Optimization

```javascript
// ✓ Good - Uses index, selects specific fields
const users = await User.find(
  { status: 'active' },
  'id name email', // Select only needed fields
  { limit: 10 }
).lean(); // Return plain objects, not full documents

// ✗ Avoid - Returns whole documents, not paginated
const users = await User.find({ status: 'active' });
```

### Form Validation

```javascript
// ✓ Good - Server and client validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
});

export const validateUserInput = (data) => {
  const { error, value } = userSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
};

// ✗ Avoid - No validation
const user = { email: req.body.email }; // Could be anything
```

### State Management

```javascript
// ✓ Good - Immutable updates
const [cart, setCart] = useState([]);

const addToCart = (product) => {
  setCart([...cart, product]); // Creates new array
};

const removeFromCart = (productId) => {
  setCart(cart.filter(item => item.id !== productId));
};

// ✗ Avoid - Mutating state directly
const addToCart = (product) => {
  cart.push(product); // Directly mutates state
  setCart(cart); // React may not detect change
};
```

---

## Performance Tips

### Backend Optimization

```javascript
// 1. Add database indexes
db.users.createIndex({ email: 1 });
db.orders.createIndex({ userId: 1, createdAt: -1 });

// 2. Use pagination
router.get('/products', (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  
  Product.find().skip(skip).limit(limit);
});

// 3. Cache frequently accessed data
const cache = new Map();
export const getCachedUser = async (userId) => {
  if (cache.has(userId)) {
    return cache.get(userId);
  }
  const user = await User.findById(userId);
  cache.set(userId, user);
  return user;
};

// 4. Use connection pooling
const pool = new Pool({
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 5. Enable gzip compression
app.use(compression());
```

### Frontend Optimization

```javascript
// 1. Code splitting
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));

// 2. Image optimization
<img 
  src={product.image} 
  alt={product.name}
  loading="lazy" // Lazy load images
  width="200"
  height="200"
/>

// 3. Memoization
export const ProductCard = memo(({ product }) => {
  return <div>{product.name}</div>;
});

// 4. Defer non-critical updates
const [isPending, startTransition] = useTransition();
const handleSearch = (query) => {
  startTransition(() => setSearchResults(query));
};

// 5. Optimize dependencies
useEffect(() => {
  fetchUser();
}, []); // Empty = only run once

useEffect(() => {
  fetchProducts();
}, [category]); // Only when category changes
```

### Mobile Optimization

```typescript
// 1. Lazy load components
const ProductDetails = lazy(() => import('./ProductDetails'));

// 2. Optimize images
import { Image } from 'expo-image';
<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  placeholder={blurhash}
  contentFit="cover"
/>

// 3. Batch state updates
const updateCart = useCallback(() => {
  batch(() => {
    setCartItems(newItems);
    setTotal(newTotal);
    setLoading(false);
  });
}, []);

// 4. Use FlatList properly
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ProductCard product={item} />}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
/>
```

---

## Security Best Practices

### Authentication
```javascript
// ✓ Use secure tokens
const token = jwt.sign(
  { userId },
  process.env.JWT_SECRET,
  { expiresIn: '1h' } // Short expiration
);

// ✓ Hash passwords
const hashedPassword = await bcrypt.hash(password, 10);
```

### Input Validation
```javascript
// ✓ Validate all inputs
const { error } = userSchema.validate(req.body);
if (error) return res.status(400).json({ error });

// ✓ Sanitize user input
const sanitized = DOMPurify.sanitize(userInput);
```

### API Security
```javascript
// ✓ Add rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// ✓ Set security headers
app.use(helmet());

// ✓ Enable CORS properly
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Data Protection
```javascript
// ✓ Encrypt sensitive data
const encrypted = crypto.encrypt(sensitiveData);

// ✓ Never log sensitive data
logger.info('User login'); // ✓
logger.info(`Password: ${password}`); // ✗

// ✓ Use HTTPS only
app.use(enforce.https());
```

---

## Testing Patterns

### Unit Test Template

```javascript
describe('ProductService', () => {
  let productService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create product with valid data', async () => {
      // Arrange
      const productData = { name: 'Product', price: 99 };
      jest.spyOn(Product, 'create').mockResolvedValue(productData);

      // Act
      const result = await productService.createProduct(productData);

      // Assert
      expect(result).toEqual(productData);
      expect(Product.create).toHaveBeenCalledWith(productData);
    });

    it('should throw error with invalid data', async () => {
      // Arrange
      const invalidData = { name: '' };

      // Act & Assert
      await expect(
        productService.createProduct(invalidData)
      ).rejects.toThrow('Invalid product data');
    });
  });
});
```

### Integration Test Template

```javascript
describe('Product API', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  describe('GET /api/products', () => {
    it('should return paginated products', async () => {
      // Arrange
      await Product.insertMany([
        { name: 'P1', price: 50 },
        { name: 'P2', price: 75 },
      ]);

      // Act
      const res = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 10 });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });
  });
});
```

---

## Debugging Tips

### Backend Debugging

```javascript
// Use console.log strategically
console.log('Before:', { userId, data });
console.log('After:', result);

// Use debugger
console.log('Setting breakpoint...');
debugger;

// Use error logging
logger.error('Database error:', error, { userId, query });

// Use VS Code debugger
// Add launch.json configuration
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/backend/src/server.js",
  "restart": true
}
```

### Frontend Debugging

```javascript
// React DevTools
// - Use React DevTools browser extension
// - Inspect component props and state

// Network tab
// - Check API calls in DevTools Network tab
// - Verify request/response headers

// Console logging
console.log('Component rendered:', props);
console.error('Error occurred:', error);

// Performance monitoring
performance.mark('start');
// ... code to measure
performance.mark('end');
performance.measure('measurement', 'start', 'end');
```

### Mobile Debugging

```typescript
// Expo debugging
expo-dev-client: 'http://localhost:8081'

// Logs
console.log('Debug info:', data);

// React Native Debugger
// Open http://localhost:8081/debugger-ui

// Remote debugging
// Press `d` in terminal to open debugger menu
```

---

## Git Workflow

### Commit Messages

```
# Feature
git commit -m "feat: add user authentication"

# Fix
git commit -m "fix: resolve payment processing issue"

# Documentation
git commit -m "docs: update API documentation"

# Test
git commit -m "test: add unit tests for checkout flow"

# ✓ Good message format:
# [type]: [description] (#[issue-number])
# - Concise and descriptive
# - References issue number
# - Uses imperative mood (add, not adds)
```

### Branch Naming

```
feature/user-authentication
bugfix/payment-processing
hotfix/critical-security-issue
docs/api-documentation
test/checkout-flow
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] No new warnings generated
- [ ] Documentation updated
- [ ] Tests added/updated
```

---

## Common Command Reference

### Backend

```bash
# Development
npm run dev           # Start with nodemon
npm test              # Run tests

# Database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:reset      # Reset database

# Deployment
npm run build         # Build for production
npm start             # Start production server
```

### Admin

```bash
# Development
npm run dev           # Start dev server
npm test              # Run tests

# Build
npm run build         # Build for production
npm run preview       # Preview production build
npm run analyze       # Analyze bundle size
```

### Mobile

```bash
# Development
npm start             # Start Expo server
npm run ios           # Run iOS simulator
npm run android       # Run Android emulator

# Build
eas build --platform ios
eas build --platform android
```

---

## Monitoring & Logging Checklist

- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] API endpoint logging
- [ ] Database query logging
- [ ] User action tracking
- [ ] Payment transaction logging
- [ ] Security event logging
- [ ] Application health checks

---

## Code Quality Tools

### Setup ESLint & Prettier

```bash
# Install
npm install --save-dev eslint prettier eslint-config-prettier

# Configure .eslintrc
{
  "extends": ["eslint:recommended", "prettier"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}

# Run
npx eslint src/
npx prettier --write src/
```

### Pre-commit Hooks

```bash
# Install husky
npm install husky --save-dev
npx husky install

# Add hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

---

## Final Checklist Before Deployment

- [ ] All tests passing
- [ ] No console warnings/errors
- [ ] Code reviewed
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Backups verified

---

**Happy Coding! 🚀**
