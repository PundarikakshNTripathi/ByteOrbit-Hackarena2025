# CivicAgent - Deployment Guide

This guide covers deploying the CivicAgent frontend to production.

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] ESLint checks passing (`npm run lint`)
- [ ] Responsive design verified on all breakpoints
- [ ] Dark mode tested
- [ ] All environment variables documented

### Supabase Setup
- [ ] Production Supabase project created
- [ ] Database schema deployed (run `database_schema.sql`)
- [ ] Storage bucket `complaint-images` created and configured
- [ ] Row Level Security (RLS) policies enabled
- [ ] Authentication providers configured
- [ ] API keys secured

### Repository
- [ ] Code pushed to GitHub/GitLab
- [ ] `.env.local` added to `.gitignore`
- [ ] README.md updated
- [ ] All sensitive data removed from code

## 🚀 Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel is built by the creators of Next.js and offers seamless deployment.

#### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Select the `ByteOrbit-Hackarena2025` repo

#### Step 2: Configure Project

1. **Root Directory**: Set to `frontend`
2. **Framework Preset**: Next.js (auto-detected)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

#### Step 3: Set Environment Variables

Add these in the Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

**Important**: Use your **production** Supabase credentials, not development ones!

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL
4. Test all features

#### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate (automatic)

### Option 2: Netlify

Alternative platform with similar features.

#### Quick Deploy

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`
5. Add environment variables (same as Vercel)
6. Click "Deploy site"

### Option 3: Custom VPS/Server

For self-hosting on your own server.

#### Requirements
- Ubuntu 20.04+ or similar Linux distro
- Node.js 18+ LTS
- Nginx or Apache
- SSL certificate (Let's Encrypt)

#### Steps

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone repository**
   ```bash
   git clone https://github.com/PundarikakshNTripathi/ByteOrbit-Hackarena2025.git
   cd ByteOrbit-Hackarena2025/frontend
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Configure environment**
   ```bash
   nano .env.local
   # Add your production variables
   ```

6. **Build application**
   ```bash
   npm run build
   ```

7. **Install PM2 (process manager)**
   ```bash
   sudo npm install -g pm2
   ```

8. **Start application**
   ```bash
   pm2 start npm --name "civicagent" -- start
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Enable SSL with Certbot**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

## 🔒 Security Best Practices

### Environment Variables

**Never commit these to Git:**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Store securely:**
- In hosting platform's environment variable settings
- In CI/CD secrets (GitHub Actions, etc.)
- In password manager for team access

### Supabase Security

1. **Use Production Keys**
   - Don't use development keys in production
   - Regenerate keys if exposed

2. **Enable RLS**
   - All tables should have Row Level Security enabled
   - Test policies thoroughly

3. **Limit Storage Access**
   - Only allow authenticated uploads if needed
   - Set file size limits
   - Validate file types

4. **Monitor Usage**
   - Set up alerts for unusual activity
   - Review Supabase logs regularly

### Application Security

1. **HTTPS Only**
   - Always use SSL in production
   - Redirect HTTP to HTTPS

2. **Content Security Policy**
   ```javascript
   // next.config.mjs
   const securityHeaders = [
     {
       key: 'X-DNS-Prefetch-Control',
       value: 'on'
     },
     {
       key: 'X-Frame-Options',
       value: 'SAMEORIGIN'
     },
     {
       key: 'X-Content-Type-Options',
       value: 'nosniff'
     }
   ]
   ```

3. **Rate Limiting**
   - Implement in Supabase or via middleware
   - Prevent abuse of API endpoints

## 📊 Monitoring & Analytics

### Error Tracking

**Sentry (Recommended)**

1. Sign up at [sentry.io](https://sentry.io)
2. Install:
   ```bash
   npm install @sentry/nextjs
   ```
3. Configure in `sentry.config.js`

### Analytics

**Vercel Analytics** (if using Vercel)
- Automatically included
- No configuration needed

**Google Analytics**
```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
```

### Performance Monitoring

**Lighthouse CI**
```bash
npm install -g @lhci/cli
lhci autorun
```

**Web Vitals**
- Built into Next.js
- View in Vercel dashboard or custom implementation

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci
      
    - name: Run linter
      working-directory: ./frontend
      run: npm run lint
      
    - name: Build
      working-directory: ./frontend
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## 🧪 Post-Deployment Testing

### Functionality Checklist
- [ ] Homepage loads correctly
- [ ] User can sign up
- [ ] User can log in
- [ ] User can log out
- [ ] Complaint form works
  - [ ] Image upload
  - [ ] Location selection
  - [ ] Form submission
- [ ] Dashboard displays
  - [ ] Map renders
  - [ ] Markers appear
  - [ ] Statistics show
- [ ] Complaint detail page works
- [ ] Theme toggle works
- [ ] Mobile view is responsive

### Performance Checklist
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Images optimized
- [ ] No console errors

### SEO Checklist
- [ ] Meta tags present
- [ ] robots.txt configured
- [ ] sitemap.xml generated
- [ ] Open Graph tags set
- [ ] Twitter Card tags set

## 🔧 Troubleshooting

### Build Fails

**Issue**: `Module not found`
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Issue**: TypeScript errors
```bash
# Solution: Fix type errors
npm run lint
# Address each error shown
```

### Runtime Errors

**Issue**: "Cannot connect to Supabase"
- Check environment variables are set correctly
- Verify Supabase URL and key
- Ensure Supabase project is active

**Issue**: Images not loading
- Check Supabase Storage bucket is public
- Verify storage policies are correct
- Ensure CORS is configured in Supabase

**Issue**: Map not displaying
- Leaflet CSS might not be loading
- Check browser console for errors
- Ensure map container has height set

## 📈 Scaling Considerations

### Database
- Index frequently queried columns
- Set up regular backups
- Monitor query performance
- Consider read replicas for high traffic

### Storage
- Implement CDN for images
- Set up image optimization pipeline
- Consider cloud storage (AWS S3, Cloudinary)

### Application
- Enable Next.js caching
- Use ISR (Incremental Static Regeneration) where possible
- Implement rate limiting
- Set up load balancer if needed

## 🎯 Launch Checklist

### Pre-Launch
- [ ] All features tested in production
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Error tracking configured
- [ ] Analytics set up
- [ ] Backup system in place
- [ ] Documentation updated

### Launch Day
- [ ] Deploy to production
- [ ] Verify all features work
- [ ] Monitor error logs
- [ ] Watch performance metrics
- [ ] Be ready to rollback if needed

### Post-Launch
- [ ] Monitor user feedback
- [ ] Track error rates
- [ ] Review performance metrics
- [ ] Plan for scaling if needed
- [ ] Document any issues found

## 📞 Support

For deployment issues:
1. Check Vercel/Netlify documentation
2. Review Supabase status page
3. Check application logs
4. Review error tracking (Sentry)
5. Contact team members

---

Good luck with your deployment! 🚀
