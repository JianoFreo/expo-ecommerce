# 13 - Testing & Quality Assurance

## Overview

Implement comprehensive testing strategy across all applications with unit tests, integration tests, and end-to-end tests.

## Backend Testing

### 1. Install Testing Framework

```bash
cd backend
npm install --save-dev jest supertest
npm install --save-dev @babel/preset-env @babel/preset-typescript
```

### 2. Configure Jest

Create `backend/jest.config.js`:

```javascript
export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/server.js',
  ],
};
```

### 3. Write Unit Tests

Create `backend/src/controllers/__tests__/productController.test.js`:

```javascript
import { getProducts, createProduct } from '../productController.js';
import Product from '../../models/Product.js';

jest.mock('../../models/Product.js');

describe('Product Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return all products with pagination', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 99.99 },
        { id: '2', name: 'Product 2', price: 149.99 },
      ];

      Product.find.mockResolvedValue(mockProducts);
      Product.countDocuments.mockResolvedValue(2);

      const req = {
        pagination: { skip: 0, limit: 10, page: 1 },
        query: {},
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getProducts(req, res);

      expect(res.json).toHaveBeenCalledWith({
        data: mockProducts,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1,
        },
      });
    });

    it('should filter products by category', async () => {
      const mockProducts = [{ id: '1', name: 'Laptop', category: 'Electronics' }];

      Product.find.mockResolvedValue(mockProducts);
      Product.countDocuments.mockResolvedValue(1);

      const req = {
        pagination: { skip: 0, limit: 10, page: 1 },
        query: { category: 'Electronics' },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getProducts(req, res);

      expect(Product.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const mockProduct = {
        id: '1',
        name: 'New Product',
        price: 99.99,
        category: 'Electronics',
      };

      Product.create.mockResolvedValue(mockProduct);

      const req = {
        validatedData: {
          name: 'New Product',
          price: 99.99,
          category: 'Electronics',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle errors', async () => {
      Product.create.mockRejectedValue(new Error('DB Error'));

      const req = {
        validatedData: { name: 'Product' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
```

### 4. Integration Tests

Create `backend/src/__tests__/products.integration.test.js`:

```javascript
import request from 'supertest';
import app from '../server.js';
import Product from '../models/Product.js';

describe('Products API Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  describe('GET /api/v1/products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await request(app).get('/api/v1/products');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return paginated products', async () => {
      // Create test products
      const products = await Product.insertMany([
        { name: 'Product 1', price: 99.99, category: 'Electronics' },
        { name: 'Product 2', price: 149.99, category: 'Electronics' },
        { name: 'Product 3', price: 29.99, category: 'Books' },
      ]);

      const response = await request(app)
        .get('/api/v1/products')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.pages).toBe(2);
    });

    it('should filter products by category', async () => {
      await Product.insertMany([
        { name: 'Laptop', price: 999.99, category: 'Electronics' },
        { name: 'Novel', price: 19.99, category: 'Books' },
      ]);

      const response = await request(app)
        .get('/api/v1/products')
        .query({ category: 'Electronics' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].category).toBe('Electronics');
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product with valid data', async () => {
      const productData = {
        name: 'New Product',
        price: 99.99,
        category: 'Electronics',
        description: 'A test product',
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(productData.name);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'ab', // Too short
        price: -10, // Negative price
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Product' });

      expect(response.status).toBe(401);
    });
  });
});
```

### 5. Add Test Scripts

In `backend/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

Run tests:

```bash
npm test
npm run test:coverage
```

## Frontend Testing

### 1. Setup Vitest for React

In `admin/`:

```bash
npm install --save-dev vitest @vitesting-library/react @vitesting-library/jest-dom
npm install --save-dev @testing-library/user-event
```

### 2. Configure Vitest

Create `admin/vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. Write Component Tests

Create `admin/src/components/__tests__/Navbar.test.jsx`:

```javascript
import { render, screen } from '@testing-library/react';
import { ClerkProvider } from '@clerk/clerk-react';
import Navbar from '../Navbar';

describe('Navbar Component', () => {
  it('renders navigation links', () => {
    render(
      <ClerkProvider publishableKey="test">
        <Navbar />
      </ClerkProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('displays user profile when logged in', () => {
    render(
      <ClerkProvider publishableKey="test">
        <Navbar />
      </ClerkProvider>
    );

    const userButton = screen.getByRole('button', { name: /profile/i });
    expect(userButton).toBeInTheDocument();
  });
});
```

## Mobile Testing

### 1. Setup Testing Library for React Native

In `mobile/`:

```bash
npm install --save-dev @testing-library/react-native jest-setup
npm install --save-dev @testing-library/jest-native
```

### 2. Configure Jest for React Native

Create `mobile/jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
};
```

### 3. Write Mobile Component Tests

Create `mobile/components/__tests__/ProductsGrid.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ProductsGrid from '../ProductsGrid';

describe('ProductsGrid Component', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1', price: 99.99 },
    { id: '2', name: 'Product 2', price: 149.99 },
  ];

  it('renders product list', () => {
    render(<ProductsGrid products={mockProducts} />);

    expect(screen.getByText('Product 1')).toBeTruthy();
    expect(screen.getByText('Product 2')).toBeTruthy();
  });

  it('displays empty state when no products', () => {
    render(<ProductsGrid products={[]} />);

    expect(screen.getByText(/no products found/i)).toBeTruthy();
  });
});
```

## E2E Testing

### 1. Setup Cypress

```bash
cd admin
npm install --save-dev cypress
npx cypress open
```

### 2. Create E2E Tests

Create `admin/cypress/e2e/auth.cy.js`:

```javascript
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should redirect to login when not authenticated', () => {
    cy.url().should('include', '/sign-in');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-profile"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.url().should('include', '/sign-in');
  });
});
```

Create `admin/cypress/e2e/products.cy.js`:

```javascript
describe('Products Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
    cy.visit('http://localhost:5173/products');
  });

  it('should display products list', () => {
    cy.get('[data-testid="product-item"]').should('have.length.greaterThan', 0);
  });

  it('should create a new product', () => {
    cy.get('[data-testid="create-product-button"]').click();

    cy.get('[data-testid="product-name"]').type('New Product');
    cy.get('[data-testid="product-price"]').type('99.99');
    cy.get('[data-testid="product-category"]').select('Electronics');
    cy.get('[data-testid="save-button"]').click();

    cy.contains('Product created successfully').should('be.visible');
    cy.get('[data-testid="product-item"]').should('contain', 'New Product');
  });

  it('should edit an existing product', () => {
    cy.get('[data-testid="product-item"]')
      .first()
      .within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });

    cy.get('[data-testid="product-name"]').clear().type('Updated Name');
    cy.get('[data-testid="save-button"]').click();

    cy.contains('Product updated successfully').should('be.visible');
  });

  it('should delete a product', () => {
    cy.get('[data-testid="product-item"]')
      .first()
      .within(() => {
        cy.get('[data-testid="delete-button"]').click();
      });

    cy.get('[data-testid="confirm-button"]').click();
    cy.contains('Product deleted successfully').should('be.visible');
  });
});
```

Add custom command for login in `admin/cypress/support/commands.js`:

```javascript
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:5173/sign-in');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});
```

### 3. Run E2E Tests

```bash
npm run cypress:open  # Interactive mode
npm run cypress:run   # Headless mode
```

## Test Coverage Goals

- **Backend**: 80%+ coverage
- **Admin**: 70%+ coverage  
- **Mobile**: 60%+ coverage

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: cd backend && npm test -- --coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd admin && npm install
      - name: Run tests
        run: cd admin && npm run test:coverage
```

## Testing Best Practices

1. **Write tests as you code** - Don't leave it for later
2. **Test happy paths and edge cases** - Coverage includes error scenarios
3. **Use descriptive test names** - What is being tested should be clear
4. **Mock external dependencies** - APIs, databases, auth services
5. **Keep tests focused** - One test per behavior
6. **Use fixtures** - Reusable test data
7. **Test user interactions** - Click, type, submit, etc.
8. **Automate testing** - CI/CD pipelines

## Next Steps

- [14-Performance-Optimization.md](./14-performance-optimization.md) - Optimize performance
- [15-Deployment.md](./15-deployment.md) - Deploy to production
