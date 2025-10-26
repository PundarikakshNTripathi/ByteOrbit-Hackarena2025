# CivicAgent - Deployment Guide
## Deploy to Vercel (Frontend) & Render (Backend)

> **Deployment Time**: 15-20 minutes total  
> **Difficulty**: Easy  
> **Cost**: $0 (using free tiers)

---

## � STEP 0: PREPARE YOUR MAIN BRANCH

Before deploying, ensure your code is on the `main` branch (standard for production deployments).

### If You Started With a Different Branch Name

```bash
# Check your current branch
git branch

# If you're on a different branch (e.g., "Initial-Prototyping-P"):
# 1. Create main branch from current state
git checkout -b main

# 2. Push main branch to GitHub
git push -u origin main

# 3. Set main as default branch on GitHub:
#    - Go to: github.com/[username]/[repo]/settings/branches
#    - Under "Default branch", click the pencil icon
#    - Select "main" and click "Update"
#    - Confirm the change
```

**Why?** Vercel and Render default to the `main` branch. Using standard branch names prevents confusion during deployment.

✅ **You're ready when**: `git branch` shows `* main` and GitHub shows main as default branch.

---

## �🚀 PART 1: DEPLOY FRONTEND TO VERCEL

### Prerequisites
- ✅ GitHub account
- ✅ Vercel account (free) - [Sign up here](https://vercel.com/signup)
- ✅ Your code pushed to GitHub

### Step 1: Prepare Frontend for Deployment

#### 1.1: Verify Build Locally
```powershell
cd frontend
npm run build
```

**Expected output**: Should complete without errors. If you see TypeScript errors, fix them first.

#### 1.2: Check Environment Variables
Make sure your `.env.local` has all required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_MAP_DEFAULT_LAT=28.6139
NEXT_PUBLIC_MAP_DEFAULT_LNG=77.2090
```

#### 1.3: Update `.gitignore`
Ensure these are in `frontend/.gitignore`:
```
.env*.local
.env
.next
node_modules
```

### Step 2: Deploy to Vercel

#### 2.1: Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your **ByteOrbit-Hackarena2025** repository
4. Select the **"main"** branch (default)

#### 2.2: Configure Build Settings
Vercel will auto-detect Next.js. Configure:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend` ⚠️ **IMPORTANT**
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

#### 2.3: Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend-url.onrender.com` (we'll get this in Part 2) |
| `NEXT_PUBLIC_MAP_DEFAULT_LAT` | `28.6139` |
| `NEXT_PUBLIC_MAP_DEFAULT_LNG` | `77.2090` |

**Note**: Skip `NEXT_PUBLIC_BACKEND_URL` for now - we'll update it after backend deployment.

#### 2.4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://civic-agent-abc123.vercel.app`

### Step 3: Verify Deployment

1. Visit your Vercel URL
2. Check homepage loads correctly
3. Try signing up/logging in (should work - it uses Supabase directly)
4. Try submitting a complaint (will fail until backend is deployed)

**Common Issues**:

❌ **Build fails with TypeScript errors**
```bash
# Run locally first to fix all type errors
npm run build
```

❌ **Environment variables not working**
- Ensure they start with `NEXT_PUBLIC_`
- Redeploy after adding env vars (Vercel → Deployments → Redeploy)

❌ **Images not loading**
- Check `next.config.mjs` has Supabase domain in `remotePatterns`

---

## 🔧 PART 2: DEPLOY BACKEND TO RENDER

### Prerequisites
- ✅ Render account (free) - [Sign up here](https://render.com/signup)
- ✅ Your code pushed to GitHub
- ✅ Supabase project ready
- ✅ Google Gemini API key
- ✅ Brevo API key

### Step 1: Prepare Backend for Deployment

#### 1.1: Create `render.yaml` (Render Blueprint)
Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: civicagent-backend
    env: python
    region: oregon
    plan: free
    branch: main
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: VISION_MODEL_NAME
        value: gemini-1.5-flash
      - key: TEXT_MODEL_NAME
        value: gemini-1.5-pro
      - key: BREVO_API_KEY
        sync: false
      - key: BREVO_SENDER_EMAIL
        sync: false
      - key: BREVO_SENDER_NAME
        value: CivicAgent
      - key: FRONTEND_URL
        sync: false
      - key: BACKEND_URL
        sync: false
```

**Note**: `sync: false` means you'll add these manually in Render dashboard.

#### 1.2: Update `requirements.txt`
Ensure it has all dependencies:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
supabase==2.3.4
google-generativeai==0.3.2
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
APScheduler==3.10.4
sib-api-v3-sdk==7.6.0
scikit-learn==1.4.0
pandas==2.2.0
numpy==1.26.3
shap==0.44.1
```

#### 1.3: Update CORS in `backend/app/core/config.py`
Make sure CORS allows your Vercel domain:
```python
class Settings(BaseSettings):
    # ... other settings ...
    
  BACKEND_CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:3001","https://civicagent.vercel.app"]'
    
    # ... rest of config ...
```

**Important**: You'll update this after getting your Vercel URL.

#### 1.4: Commit Changes
```bash
git add backend/render.yaml backend/requirements.txt
git commit -m "Add Render deployment config"
git push origin main
```

### Step 2: Deploy to Render

#### 2.1: Create New Web Service
1. Go to [render.com/dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select **ByteOrbit-Hackarena2025** repository

#### 2.2: Configure Service
- **Name**: `civicagent-backend`
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANT**
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Plan**: `Free`

#### 2.3: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `PYTHON_VERSION` | `3.11.0` | Specify Python version |
| `SUPABASE_URL` | `https://xxx.supabase.co` | From Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | From Supabase → Settings → API → service_role key |
| `GEMINI_API_KEY` | `AIza...` | From Google AI Studio |
| `VISION_MODEL_NAME` | `gemini-1.5-flash` | Vision model |
| `TEXT_MODEL_NAME` | `gemini-1.5-pro` | Text model |
| `BREVO_API_KEY` | `xkeysib-...` | From Brevo dashboard |
| `BREVO_SENDER_EMAIL` | `noreply@yourdomain.com` | Verified sender email |
| `BREVO_SENDER_NAME` | `CivicAgent` | Sender name |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel URL |
| `BACKEND_URL` | `https://civicagent-backend.onrender.com` | Auto-generated (use placeholder for now) |

#### 2.4: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for initial build
3. You'll get a URL like: `https://civicagent-backend.onrender.com`

### Step 3: Verify Backend Deployment

1. Visit `https://civicagent-backend.onrender.com/docs`
2. You should see the FastAPI Swagger documentation
3. Try the `/health` endpoint - should return `{"status": "healthy"}`

**Common Issues**:

❌ **Build fails: "No module named 'app'"**
- Ensure **Root Directory** is set to `backend`

❌ **Python version error**
- Add `PYTHON_VERSION=3.11.0` env var
- Or create `runtime.txt` with `python-3.11.0`

❌ **Port binding error**
- Ensure start command uses `--port $PORT` (not hardcoded 8000)

❌ **Gemini API quota exceeded**
- Use `gemini-1.5-flash` for vision (faster, more quota)
- Implement rate limiting in production

---

## 🔗 PART 3: CONNECT FRONTEND & BACKEND

### Step 1: Update Frontend Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Edit `NEXT_PUBLIC_BACKEND_URL`:
   - **Value**: `https://civicagent-backend.onrender.com` (your Render URL)
4. Click **"Save"**
5. Go to **Deployments** → Click **"Redeploy"** on latest deployment

### Step 2: Update Backend CORS

1. Go to your Render service dashboard
2. Navigate to **Environment** tab
3. Add/update variable:
  - **Key**: `BACKEND_CORS_ORIGINS`
  - **Value**: `["https://civicagent.vercel.app","http://localhost:3000","http://localhost:3001"]`
4. Click **"Save Changes"**
5. Render will auto-redeploy

**Alternative**: Update `backend/app/core/config.py` and push:
```python
BACKEND_CORS_ORIGINS: str = '["https://civicagent.vercel.app","http://localhost:3000"]'
```

### Step 3: Test Full Stack

1. Visit your Vercel URL
2. Sign up/login
3. Submit a complaint with an image
4. Wait for AI analysis (should work now!)
5. Check admin dashboard
6. Verify emails are sent (check spam folder)

---

## 🎯 PART 4: FINAL OPTIMIZATIONS

### Frontend (Vercel)

#### Enable Analytics
1. Vercel Dashboard → Your Project → **Analytics**
2. Enable **Web Analytics** (free)
3. Track real user metrics

#### Custom Domain (Optional)
1. Buy domain (Namecheap, GoDaddy, etc.)
2. Vercel → **Settings** → **Domains**
3. Add domain and follow DNS instructions

#### Performance Optimization
```bash
# Already done in your next.config.mjs:
- Image optimization (Next.js Image component)
- Code splitting (App Router)
- Compression enabled by Vercel
```

### Backend (Render)

#### Enable Persistent Disk (If needed for model storage)
1. Render Dashboard → Your Service → **Disk**
2. Add disk (free tier: 1GB)
3. Mount path: `/app/models`

#### Health Check Endpoint
Already implemented in `app/main.py`:
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

Render auto-uses this for health checks.

#### Auto-Deploy on Git Push
Already enabled! Every push to your branch auto-deploys.

---

## 📊 MONITORING & MAINTENANCE

### Vercel Monitoring
- **Dashboard**: Real-time deployment logs
- **Analytics**: Page views, Web Vitals
- **Errors**: Runtime errors in serverless functions

### Render Monitoring
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory usage (free tier limited)
- **Health Checks**: Automatic restarts if unhealthy

### Supabase Monitoring
- **Database**: Query performance, connection pooling
- **Storage**: Usage limits (1GB free tier)
- **Auth**: User signups, sessions

---

## 🚨 TROUBLESHOOTING COMMON DEPLOYMENT ISSUES

### Issue 1: CORS Errors in Production
**Symptom**: Frontend can't reach backend, browser console shows CORS error

**Solution**:
```python
BACKEND_CORS_ORIGINS: str = '["https://civicagent.vercel.app"]'
```
OR set `BACKEND_CORS_ORIGINS` env var in Render dashboard.

### Issue 2: Environment Variables Not Working
**Symptom**: Backend crashes with "SUPABASE_URL not found"

**Solution**:
- Verify all env vars in Render dashboard
- Click "Manual Deploy" to force rebuild
- Check logs for which variable is missing

### Issue 3: Render Service Sleeping (Free Tier)
**Symptom**: First request takes 30+ seconds

**Solution** (Free tier limitation):
- Free services sleep after 15 minutes of inactivity
- First request wakes it up (30-60 second delay)
- Upgrade to paid plan ($7/mo) for always-on service
- Or implement a cron job to ping every 10 minutes

### Issue 4: Vercel Build Timeout
**Symptom**: Build exceeds time limit

**Solution**:
```bash
# Reduce bundle size
npm run build -- --profile
# Analyze output, remove unused dependencies
```

### Issue 5: Gemini API Rate Limits
**Symptom**: AI analysis fails in production

**Solution**:
1. Switch to `gemini-1.5-flash` (more quota)
2. Implement caching for repeated images
3. Add retry logic with exponential backoff:
```python
import time
from google.api_core import retry

@retry.Retry(deadline=30)
async def analyze_with_retry(image):
    # Your Gemini call
```

### Issue 6: Database Connection Limits
**Symptom**: "Too many connections" error

**Solution**:
- Supabase free tier: 500 concurrent connections
- Use connection pooling (already implemented in Supabase client)
- Upgrade Supabase plan if needed

---

## ✅ DEPLOYMENT CHECKLIST

Before going live, verify:

### Security
- [ ] All secrets in environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] CORS properly configured (not `["*"]` in production)
- [ ] Service role key only in backend (never in frontend)
- [ ] Rate limiting implemented (if needed)

### Performance
- [ ] Frontend build succeeds without warnings
- [ ] Images optimized (using Next.js Image component)
- [ ] Database indexes created (for common queries)
- [ ] API response times < 3 seconds

### Functionality
- [ ] User signup/login works
- [ ] Complaint submission works
- [ ] AI analysis returns results
- [ ] Emails are sent successfully
- [ ] Dashboard displays data correctly
- [ ] Mobile responsive (test on phone)

### Monitoring
- [ ] Vercel analytics enabled
- [ ] Render logs accessible
- [ ] Error tracking set up (optional: Sentry)
- [ ] Supabase usage monitored

---

## 💰 COST BREAKDOWN (Free Tier Limits)

| Service | Free Tier | Upgrade Cost | When to Upgrade |
|---------|-----------|--------------|-----------------|
| **Vercel** | 100GB bandwidth/mo | $20/mo (Pro) | If >10k users/mo |
| **Render** | 750 hours/mo | $7/mo (Starter) | For always-on service |
| **Supabase** | 500MB database, 1GB storage | $25/mo (Pro) | If >50k rows or >1GB files |
| **Gemini API** | 60 requests/min (free) | Pay-as-you-go | If >1k requests/day |
| **Brevo** | 300 emails/day | $25/mo (Lite) | If >300 emails/day |

**Total free tier**: $0/month for demo/testing  
**Basic production**: ~$50-100/month for real traffic

---

## 🎓 NEXT STEPS AFTER DEPLOYMENT

1. **Set up custom domain** (optional but professional)
2. **Enable monitoring** (Vercel Analytics + Render metrics)
3. **Test with real users** (friends, family, beta testers)
4. **Gather feedback** and iterate
5. **Write case study** for your portfolio
6. **Submit to hackathon** and win! 🏆

---

## 📞 GETTING HELP

**Stuck on deployment?**

- **Vercel**: [docs.vercel.com](https://vercel.com/docs)
- **Render**: [render.com/docs](https://render.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: Stack Overflow, Discord servers

**Your project is ready to ship! Deploy with confidence! 🚀**
