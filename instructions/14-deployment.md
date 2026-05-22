# 14 - Production Deployment

## Overview

Deploy the full e-commerce application to production across multiple cloud platforms.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (backend, frontend, mobile)
- [ ] No console errors or warnings
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Environment variables configured

### Performance
- [ ] Database indexes created
- [ ] API endpoints optimized
- [ ] Frontend bundle size < 500KB (gzipped)
- [ ] Lazy loading implemented
- [ ] CDN configured for static assets

### Security
- [ ] CORS configured correctly
- [ ] HTTPS enabled
- [ ] API keys secured
- [ ] Sensitive data encrypted
- [ ] Rate limiting enabled
- [ ] Input validation active

## Backend Deployment (Heroku)

### 1. Prepare for Production

In `backend/.env.production`:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=production_db_url
REDIS_URL=redis://...
JWT_SECRET=your_secret_key
CLERK_SECRET_KEY=your_clerk_key
SENTRY_DSN=your_sentry_dsn
```

### 2. Create Procfile

Create `backend/Procfile`:

```
web: npm start
```

### 3. Configure Package.json

```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 4. Deploy to Heroku

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
heroku config:set CLERK_SECRET_KEY=your_clerk_key

# Deploy
git push heroku main

# Run database migrations
heroku run npm run db:migrate

# View logs
heroku logs --tail
```

## Admin Dashboard Deployment (Vercel)

### 1. Build Configuration

In `admin/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})
```

### 2. Environment Variables for Vercel

Create `admin/.env.production`:

```
VITE_API_URL=https://your-api.herokuapp.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_SENTRY_DSN=your_sentry_dsn
```

### 3. Deploy

```bash
cd admin

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts and connect your GitHub repo for auto-deployments
```

Or via GitHub:

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Select your repository
5. Add environment variables
6. Deploy

## Mobile App Deployment

### 1. Build Android APK (EAS Build)

```bash
cd mobile

# Login to Expo
eas login

# Configure build
eas build --platform android --auto-submit
```

### 2. Build iOS App (Apple Developer Account Required)

```bash
eas build --platform ios
```

### 3. Submit to App Stores

#### Google Play Store

```bash
# Build and submit
eas submit --platform android

# When prompted:
# - Select "Google Play"
# - Enter service account JSON file path
```

#### Apple App Store

```bash
# Build and submit (requires Apple Developer account)
eas submit --platform ios

# When prompted:
# - Select "App Store"
# - Enter Apple ID and app-specific password
```

### 4. Monitor Distribution

```bash
# View build status
eas build:list

# View submit status
eas submission:list
```

## Database Setup (Production)

### PostgreSQL on AWS RDS

1. **Create RDS Instance**
   - Go to AWS Console → RDS
   - Create Database
   - Engine: PostgreSQL 14+
   - DB instance class: db.t3.micro (free tier)
   - Storage: 20GB, gp2

2. **Get Connection String**
   ```
   postgresql://username:password@rds-endpoint.rds.amazonaws.com:5432/dbname
   ```

3. **Run Migrations**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/db npm run db:migrate
   ```

### MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
4. Add to environment variables

## Monitoring & Analytics

### 1. Sentry Dashboard

- Go to [sentry.io](https://sentry.io)
- Setup alerts for error rates
- Monitor performance metrics
- Track releases

### 2. Analytics (Google Analytics)

In `admin/src/main.jsx` and `mobile/app/_layout.tsx`:

```javascript
import GoogleAnalytics from '@react-ga/react-ga';

GoogleAnalytics.initialize('GA_ID');
GoogleAnalytics.pageview(window.location.pathname);
```

### 3. Uptime Monitoring

Use [UptimeRobot](https://uptimerobot.com):

1. Add monitors for:
   - Backend API: `https://api.example.com/health`
   - Admin: `https://admin.example.com`
   - Mobile: Monitor app releases

2. Set notifications for downtime

## CDN Setup (Cloudflare)

### 1. Add Domain

1. Go to Cloudflare
2. Add domain
3. Update nameservers at domain registrar

### 2. Setup Rules

1. **Page Rules**
   - Cache everything: `admin.example.com/*`
   - Bypass cache: `api.example.com/api/*`

2. **Security**
   - Enable SSL/TLS: Full
   - Enable Minimum TLS Version: 1.2
   - Enable HSTS

## Continuous Deployment

### GitHub Actions for Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Heroku
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          cd backend
          git push https://heroku:$HEROKU_API_KEY@git.heroku.com/your-app.git main

  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm i -g vercel
          cd admin
          vercel --prod --token $VERCEL_TOKEN
```

## SSL/TLS Certificates

### Let's Encrypt (Free)

```bash
# Using Certbot
certbot certonly --standalone -d example.com -d www.example.com

# Renews automatically
certbot renew
```

## Database Backups

### Automated Backups

**PostgreSQL RDS:**
- AWS handles automatic backups
- Configure backup retention: 7-35 days
- Enable automated minor version upgrades

**MongoDB Atlas:**
- Cloud backups enabled by default
- Restore snapshots from dashboard

### Manual Backup

```bash
# PostgreSQL
pg_dump "postgresql://user:pass@host:5432/db" > backup.sql

# MongoDB
mongodump --uri "mongodb+srv://..." --out ./backup

# Restore
psql "postgresql://..." < backup.sql
```

## Performance Optimization

### API Response Caching

```javascript
app.use(require('express-cache-headers'));

// Cache for 1 hour
app.get('/api/products', cacheHeaders({ maxAge: 3600 }), (req, res) => {
  // ...
});
```

### Database Query Optimization

```javascript
// Add indexes
db.products.createIndex({ category: 1 });
db.orders.createIndex({ userId: 1, createdAt: -1 });
```

### Frontend Optimization

```bash
# Build analysis
npm run build -- --analyze

# Optimize images
npm install imagemin imagemin-mozjpeg

# Code splitting
const Products = lazy(() => import('./pages/Products'));
```

## Disaster Recovery Plan

### 1. Backup Strategy
- Daily automated backups
- Weekly manual backups
- Test restore procedures monthly

### 2. Incident Response
- Document runbooks
- Alert team on critical issues
- Maintain incident log

### 3. Rollback Procedure

**Backend:**
```bash
heroku releases
heroku rollback v123
```

**Frontend:**
```bash
# Vercel auto-generates previews
# Can rollback from deployment history
```

## Post-Deployment Checklist

- [ ] All services running
- [ ] Health checks passing
- [ ] Error monitoring active
- [ ] Analytics collecting data
- [ ] SSL certificates valid
- [ ] Database backups verified
- [ ] Logs being aggregated
- [ ] Performance satisfactory
- [ ] User acceptance testing complete
- [ ] Documentation updated

## Maintenance Tasks

### Weekly
- Check error logs
- Review performance metrics
- Test backup restoration

### Monthly
- Security updates
- Database optimization
- Log analysis

### Quarterly
- Capacity planning
- Feature analytics review
- Security audit

## Troubleshooting Production Issues

### Backend Issues

```bash
# Check logs
heroku logs --tail -a your-app

# Restart app
heroku restart -a your-app

# Check database connection
heroku pg:psql
```

### Frontend Issues

```bash
# Check build logs
vercel logs your-project

# Rebuild deployment
vercel --prod --force
```

### Database Issues

```bash
# Check slow queries
EXPLAIN ANALYZE SELECT ...;

# Reindex
REINDEX DATABASE dbname;
```

## Security Post-Launch

1. **Enable WAF** (Web Application Firewall)
   - Cloudflare WAF rules
   - OWASP Top 10 protection

2. **API Security**
   - Rate limiting configured
   - CORS properly set
   - HTTPS only

3. **Data Protection**
   - Encryption at rest
   - Encryption in transit
   - Regular security audits

## Support & Monitoring Tools

- **Sentry**: Error tracking
- **UptimeRobot**: Uptime monitoring
- **Datadog**: Performance monitoring
- **LogRocket**: Session replay (frontend)
- **New Relic**: APM (Application Performance Management)

## Next Steps

- Monitor performance metrics
- Gather user feedback
- Plan next feature releases
- Optimize based on analytics
- Schedule security audits

## Quick Links

- Backend API: `https://your-api.herokuapp.com/api-docs`
- Admin Dashboard: `https://admin.example.com`
- Mobile App: iOS & Android stores
- Monitoring: [Sentry](https://sentry.io), [Vercel](https://vercel.com), [Heroku](https://dashboard.heroku.com)
