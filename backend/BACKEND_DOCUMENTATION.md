# CivicAgent Backend Documentation

**Version 1.0.0** | AI-Powered Civic Engagement Platform

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [AI Services](#ai-services)
9. [Autonomous Agent Workflow](#autonomous-agent-workflow)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The CivicAgent backend is a production-ready FastAPI application that powers the AI-driven civic complaint management system. It implements:

- **AI Vision Analysis**: Google Gemini Pro Vision for automatic issue detection from images
- **AI Reasoning Agent**: Google Gemini Pro for intelligent categorization and report generation
- **Autonomous Workflow**: APScheduler-based system for automatic follow-ups and escalations
- **Explainable AI**: SHAP-powered explanations for decision transparency
- **Email Automation**: Brevo integration for stakeholder notifications
- **RESTful API**: Complete API for frontend integration

### Key Features

✅ **Real-time AI Analysis** - 2-second image analysis with 85-99% confidence  
✅ **Smart Department Assignment** - Automatic routing to correct municipal department  
✅ **SLA Management** - Automatic tracking and breach detection  
✅ **Autonomous Follow-ups** - Scheduled checks and reminders  
✅ **Intelligent Escalation** - ML-based decision making with SHAP explanations  
✅ **Email Notifications** - Automated stakeholder communication  
✅ **Admin Dashboard** - Comprehensive statistics and management tools

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API
┌──────────────────────┴──────────────────────────────────────┐
│                   FastAPI Backend                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   API      │  │  Services  │  │  Scheduler │            │
│  │ Endpoints  │→ │   Layer    │← │ (APScheduler)│           │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │              │                │                    │
│         ↓              ↓                ↓                    │
│  ┌────────────────────────────────────────┐                 │
│  │        Supabase (PostgreSQL)           │                 │
│  └────────────────────────────────────────┘                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
   ┌────┴─────┐                  ┌────┴─────┐
   │  Gemini  │                  │  Brevo   │
   │   API    │                  │  Email   │
   └──────────┘                  └──────────┘
```

### Component Layers

1. **API Layer** (`app/api/endpoints/`)
   - REST endpoints for complaints, admin, authentication
   - Request/response validation with Pydantic
   - JWT-based authentication

2. **Services Layer** (`app/services/`)
   - AI vision model integration
   - AI reasoning agent
   - Decision model with SHAP
   - Email service (Brevo)
   - Agent workflow orchestration
   - Task scheduler

3. **Data Layer** (`app/db/`)
   - Supabase client management
   - Pydantic models for type safety
   - Database operations

4. **Core Layer** (`app/core/`)
   - Configuration management
   - Security utilities (JWT, hashing)

---

## 🛠️ Technology Stack

### Framework & Runtime
- **FastAPI** 0.109.0 - Modern async web framework
- **Python** 3.11+ - Programming language
- **Uvicorn** 0.27.0 - ASGI server

### AI & ML
- **Google Generative AI** 0.3.2 - Gemini Pro Vision & Gemini Pro
- **Scikit-learn** 1.4.0 - Decision model (LogisticRegression)
- **SHAP** 0.44.1 - Explainable AI library
- **Pandas** 2.2.0 - Data manipulation
- **NumPy** 1.26.3 - Numerical computing

### Database & Storage
- **Supabase** 2.3.4 - PostgreSQL database + Auth + Storage

### Task Scheduling
- **APScheduler** 3.10.4 - Autonomous background jobs

### Email Service
- **sib-api-v3-sdk** 7.6.0 - Brevo (SendinBlue) API client

### Utilities
- **Pydantic** 2.5.3 - Data validation
- **Pydantic Settings** 2.1.0 - Environment variable management
- **python-jose** 3.3.0 - JWT token handling
- **passlib** 1.7.4 - Password hashing
- **python-multipart** 0.0.6 - File upload handling

---

## 🚀 Local Setup

### Prerequisites

1. **Python 3.11+** installed
2. **Conda** environment manager
3. **Git Bash** (for Windows users)
4. **Supabase account** (free tier)
5. **Google AI Studio account** (free Gemini API key)
6. **Brevo account** (free tier, 300 emails/day)

### Step-by-Step Installation

#### 1. Create and Activate Conda Environment

```bash
# Create environment
conda create -n CivicAgent python=3.11 -y

# Activate environment
conda activate CivicAgent
```

#### 2. Navigate to Backend Directory

```bash
cd backend
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use any text editor
```

Required variables:
- `SUPABASE_URL` - From Supabase project settings
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)
- `GEMINI_API_KEY` - From Google AI Studio
- `BREVO_API_KEY` - From Brevo dashboard
- `BREVO_SENDER_EMAIL` - Verified sender email in Brevo

#### 5. Set Up Database

a. **Create Supabase Project** at https://supabase.com

b. **Run Frontend Schema First**:
   - Open Supabase SQL Editor
   - Run `frontend/database_schema.sql` (complete file)

c. **Run Backend Schema**:
   - In Supabase SQL Editor
   - Run `backend/database_schema_backend.sql`

This creates:
- `departments` table with sample municipal departments
- SLA tracking fields in `complaints` table
- Helpful views for analytics

d. **Create Storage Bucket**:
   - Go to Supabase Storage
   - Create bucket: `complaint-images`
   - Make it **Public**

#### 6. Train Decision Model (First Run Only)

The decision model will auto-train on first run. To pre-train:

```bash
python -c "from app.services.decision_model import decision_model; decision_model.train()"
```

This creates `models/decision_model.pkl` and `models/scaler.pkl`.

#### 7. Run Development Server

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# OR using Python
python -m app.main
```

#### 8. Verify Installation

Open browser to:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🔐 Environment Variables

### Complete `.env` Template

```env
# ===== Supabase =====
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===== Google Gemini AI =====
GEMINI_API_KEY=AIzaSy...

# ===== Brevo Email =====
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=CivicAgent System

# ===== JWT Security =====
JWT_SECRET_KEY=your-super-secret-key-min-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ===== App Config =====
DEBUG=False
APP_NAME=CivicAgent API
APP_VERSION=1.0.0

# ===== Scheduler =====
SCHEDULER_TIMEZONE=Asia/Kolkata
FOLLOW_UP_CHECK_INTERVAL_MINUTES=60

# ===== AI Models =====
VISION_MODEL_NAME=gemini-1.5-flash
REASONING_MODEL_NAME=gemini-1.5-flash
AI_TEMPERATURE=0.7

# ===== Storage =====
STORAGE_BUCKET=complaint-images
MAX_UPLOAD_SIZE=10485760
```

### Variable Descriptions

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ Yes | - |
| `SUPABASE_ANON_KEY` | Public anonymous key | ✅ Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin service role key | ✅ Yes | - |
| `GEMINI_API_KEY` | Google AI Studio API key | ✅ Yes | - |
| `BREVO_API_KEY` | Brevo/SendinBlue API key | ✅ Yes | - |
| `BREVO_SENDER_EMAIL` | Verified sender email | ✅ Yes | - |
| `JWT_SECRET_KEY` | Secret for JWT signing | ❌ No | Auto-generated (change in prod!) |
| `SCHEDULER_TIMEZONE` | Timezone for scheduler | ❌ No | Asia/Kolkata |
| `FOLLOW_UP_CHECK_INTERVAL_MINUTES` | How often to check complaints | ❌ No | 60 |

---

## 💾 Database Schema

### Core Tables

#### `complaints`
```sql
id                    UUID PRIMARY KEY
user_id               UUID (references auth.users)
category              TEXT
description           TEXT
landmark              TEXT
latitude              DECIMAL
longitude             DECIMAL
image_url             TEXT
status                TEXT (submitted|in_progress|escalated|resolved|rejected)
ai_detected_category  TEXT
ai_confidence         INTEGER
ai_report             TEXT
assigned_department   TEXT (soft FK to departments.id)
official_summary      TEXT
sla_hours             INTEGER
sla_deadline          TIMESTAMP WITH TIME ZONE
user_rating           INTEGER (1-5)
user_feedback         TEXT
created_at            TIMESTAMP WITH TIME ZONE
updated_at            TIMESTAMP WITH TIME ZONE
```

#### `departments`
```sql
id                TEXT PRIMARY KEY
name              TEXT UNIQUE
description       TEXT
contact_email     TEXT
escalation_email  TEXT
priority_level    INTEGER (1-10)
created_at        TIMESTAMP WITH TIME ZONE
updated_at        TIMESTAMP WITH TIME ZONE
```

#### `complaint_actions`
```sql
id             UUID PRIMARY KEY
complaint_id   UUID (references complaints.id)
action_type    TEXT (submitted|emailed|escalated|follow_up|status_change...)
description    TEXT
metadata       JSONB
created_at     TIMESTAMP WITH TIME ZONE
```

### Sample Departments

| ID | Name | Priority | SLA (hours) |
|----|------|----------|-------------|
| `water` | Water Supply & Drainage | 10 | 12 |
| `construction` | Building & Construction Control | 9 | 168 |
| `sanitation` | Sanitation Department | 8 | 24 |
| `roads` | Roads & Infrastructure | 7 | 72 |
| `electricity` | Electricity & Lighting | 6 | 48 |
| `parks` | Parks & Environment | 5 | 96 |
| `general` | General Municipal Services | 5 | 72 |

---

## 📡 API Endpoints

### Base URL: `http://localhost:8000`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | ❌ No |
| POST | `/auth/login` | Login and get JWT token | ❌ No |
| POST | `/auth/logout` | Logout (client-side) | ❌ No |

**Signup/Login Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

### Complaint Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/complaints/` | Create new complaint with AI analysis | ✅ User |
| GET | `/complaints/` | List all complaints (public map view) | ❌ No |
| GET | `/complaints/{id}` | Get complaint details with timeline | ❌ No |
| POST | `/complaints/{id}/feedback` | Submit user feedback (resolved only) | ✅ User (owner) |
| GET | `/complaints/{id}/explanation` | Get AI decision explanation (SHAP) | ✅ User |

**Create Complaint (Multipart Form):**
```
POST /complaints/
Content-Type: multipart/form-data
Authorization: Bearer <token>

category: "Pothole"
description: "Large pothole causing traffic issues"
latitude: 28.6139
longitude: 77.2090
landmark: "Near City Hall"
image: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully. AI analysis complete.",
  "complaint_id": "uuid",
  "complaint": {
    "id": "uuid",
    "category": "Pothole",
    "status": "submitted",
    "ai_detected_category": "Pothole",
    "ai_confidence": 95,
    "assigned_department": "roads",
    "sla_hours": 72,
    ...
  }
}
```

**List Complaints:**
```
GET /complaints/?page=1&page_size=20&status_filter=submitted
```

**Submit Feedback:**
```json
POST /complaints/{id}/feedback

{
  "rating": 5,
  "feedback": "Issue resolved quickly. Great work!"
}
```

**AI Explanation:**
```json
GET /complaints/{id}/explanation

Response:
{
  "complaint_id": "uuid",
  "current_status": "in_progress",
  "recommended_action": "follow_up",
  "shap_values": {
    "time_since_sla_breach": -5.2,
    "category_priority": 2.1,
    "number_of_followups": 0.5,
    ...
  },
  "feature_importance": {
    "time_since_sla_breach": 5.2,
    "category_priority": 2.1,
    ...
  },
  "explanation_text": "Follow-up email recommended. Issue is within SLA parameters...",
  "confidence": 0.87
}
```

---

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/complaints` | List all complaints with filters | ✅ Admin |
| PUT | `/admin/complaints/{id}` | Update complaint status | ✅ Admin |
| GET | `/admin/dashboard/stats` | Get dashboard statistics | ✅ Admin |

**List All Complaints (Admin):**
```
GET /admin/complaints?page=1&page_size=50&status_filter=escalated&search=pothole
```

**Update Status:**
```json
PUT /admin/complaints/{id}

{
  "status": "resolved",
  "admin_notes": "Issue fixed by maintenance team"
}
```

**Dashboard Stats:**
```json
GET /admin/dashboard/stats

Response:
{
  "total_complaints": 150,
  "submitted": 20,
  "in_progress": 45,
  "escalated": 10,
  "resolved": 70,
  "rejected": 5,
  "avg_resolution_time_hours": 48.5,
  "sla_compliance_rate": 85.7
}
```

---

## 🤖 AI Services

### 1. Vision Model (`services/vision_model.py`)

**Function**: `analyze_image_for_civic_issue(image_url)`

**Model**: Google Gemini 1.5 Flash Vision

**Process**:
1. Receives public image URL
2. Sends to Gemini Vision API with detailed prompt
3. AI identifies primary civic issue
4. Returns structured JSON

**Prompt Strategy**:
- Instructs to classify into predefined categories
- Requests confidence score (0.7-0.99)
- Asks for brief summary and detected objects
- Specifies severity level

**Output**:
```python
AIAnalysisResult(
    issue="Pothole",
    confidence=0.95,
    summary="A large, deep pothole in the middle of an asphalt road.",
    detected_objects=["pothole", "road", "asphalt"],
    severity="high"
)
```

---

### 2. Reasoning Agent (`services/gen_ai.py`)

**Function**: `reason_about_complaint(vision_result, user_description, lat, lon)`

**Model**: Google Gemini 1.5 Flash

**Process**:
1. Takes vision analysis + user input
2. Fetches available departments from database
3. Sends comprehensive reasoning prompt to Gemini
4. AI finalizes category, assigns department, generates official summary
5. Determines SLA based on Swachh Bharat Mission standards

**Prompt Strategy**:
- Provides vision analysis results
- Lists all available departments with IDs
- References SLA standards
- Requests structured JSON output

**Output**:
```python
AIReasoningResult(
    category="Pothole",
    department_id="roads",
    department_name="Roads & Infrastructure",
    official_summary="Report of significant road damage at coordinates (28.6139, 77.2090) near City Hall. Large pothole requires immediate attention to prevent accidents.",
    sla_hours=72,
    priority_level=7,
    recommended_action="Dispatch maintenance crew for assessment and repair"
)
```

**SLA Reference Table**:
| Category | SLA (hours) | Reference |
|----------|-------------|-----------|
| Water Leakage | 12 | Emergency |
| Garbage Dump | 24 | Swachh Bharat Mission |
| Streetlight Out | 48 | Municipal Standard |
| Pothole | 72 | Municipal Standard |
| Tree Cutting | 96 | Environmental Dept |
| Broken Footpath | 120 | Low Priority |
| Illegal Construction | 168 | Legal Process |

---

### 3. Decision Model (`services/decision_model.py`)

**Model**: Scikit-learn LogisticRegression

**Purpose**: Decide whether to send follow-up or escalate complaint

**Features**:
- `time_since_sla_breach` - Hours before/after SLA deadline
- `category_priority` - Department priority (1-10)
- `number_of_followups` - Count of previous follow-ups
- `days_since_submission` - Age of complaint
- `status_score` - Encoded status value

**Training**:
- Trained on 500 synthetic samples
- Auto-trains on first run
- Saved to `models/decision_model.pkl`

**Decision Logic**:
```
Escalate IF:
  - SLA breached by > 24 hours, OR
  - High priority (≥8) AND ≥2 follow-ups, OR
  - Complaint age > 14 days

ELSE:
  - Send follow-up
```

**SHAP Integration**:
- Uses `shap.LinearExplainer`
- Generates feature importance
- Provides human-readable explanations

**API Usage**:
```python
from app.services.decision_model import decision_model
from app.db.models import DecisionFeatures

features = DecisionFeatures(
    time_since_sla_breach=30.0,  # 30 hours past deadline
    category_priority=8,
    number_of_followups=1,
    days_since_submission=5.0,
    status_score=2
)

action, confidence = decision_model.predict_action(features)
# action = "escalate", confidence = 0.92

explanation = decision_model.explain_prediction(features)
# Returns SHAP values and explanation text
```

---

## 🔄 Autonomous Agent Workflow

### Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              User Submits Complaint (with Image)             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────────┐
│  1. Upload Image to Supabase Storage                        │
│     → Get public URL                                        │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────────┐
│  2. AI Vision Analysis (Gemini Pro Vision)                  │
│     → Detect issue category                                 │
│     → Generate summary                                      │
│     → Calculate confidence (85-99%)                         │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────────┐
│  3. AI Reasoning (Gemini Pro)                               │
│     → Finalize category                                     │
│     → Assign department                                     │
│     → Generate official summary                             │
│     → Determine SLA hours                                   │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────────┐
│  4. Save to Database                                        │
│     → Insert complaint record                               │
│     → Log "submitted" action                                │
│     → Set SLA deadline                                      │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────────┐
│  5. Send Initial Email (Brevo)                              │
│     → Email to department contact                           │
│     → Include complaint details + image                     │
│     → Log "email_sent" action                               │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────────┐
│  6. Schedule Follow-up (APScheduler)                        │
│     → Schedule check at 80% of SLA time                     │
│     → Add to periodic check queue                           │
└────────────────────────┬────────────────────────────────────┘
                         ↓
        ┌────────────────┴────────────────┐
        │    Wait for scheduled time      │
        └────────────────┬────────────────┘
                         ↓
┌────────────────────────────────────────────────────────────┐
│  7. Periodic Check (Every 60 minutes)                       │
│     → Fetch all non-resolved complaints                     │
│     → Calculate features for each                           │
│     → Run decision model                                    │
└────────────────────────┬────────────────────────────────────┘
                         ↓
              ┌──────────┴──────────┐
              │   Decision Model    │
              │   (SHAP-enabled)    │
              └──────────┬──────────┘
                         ↓
            ┌────────────┴────────────┐
            │                         │
            ↓                         ↓
   ┌────────────────┐      ┌────────────────┐
   │  Follow-up     │      │   Escalate     │
   └────────┬───────┘      └────────┬───────┘
            │                       │
            ↓                       ↓
   ┌────────────────┐      ┌────────────────┐
   │ Send reminder  │      │ Email escalation│
   │ to department  │      │ to supervisor   │
   └────────┬───────┘      └────────┬───────┘
            │                       │
            ↓                       ↓
   ┌────────────────┐      ┌────────────────┐
   │ Log action     │      │ Update status  │
   │ Schedule next  │      │ Log action     │
   └────────────────┘      └────────────────┘
```

### Key Workflow Components

#### `services/agent_workflow.py`

**Functions**:

1. **`initialize_complaint_workflow()`**
   - Called after complaint creation
   - Sends initial notification email
   - Logs email action

2. **`process_complaint_followup(complaint_id)`**
   - Triggered by scheduler
   - Fetches complaint details
   - Calculates decision features
   - Runs decision model
   - Executes recommended action

3. **`execute_followup(complaint, features)`**
   - Sends reminder email to department
   - Logs follow-up action
   - Department notified of pending complaint

4. **`execute_escalation(complaint, features)`**
   - Sends escalation email to supervisor
   - Updates complaint status to "escalated"
   - Logs escalation with reason

#### `services/scheduler.py`

**APScheduler Configuration**:

```python
scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")

# Periodic job - runs every 60 minutes
scheduler.add_job(
    func=check_pending_complaints,
    trigger=IntervalTrigger(minutes=60),
    id='periodic_complaint_check'
)
```

**Job Functions**:

1. **`check_pending_complaints()`**
   - Runs every hour
   - Queries all non-resolved complaints
   - Triggers follow-up for complaints meeting criteria:
     - More than 24 hours old
     - Approaching SLA deadline (≥80% of SLA time)
     - SLA already breached

2. **`schedule_complaint_followup(complaint_id, sla_hours)`**
   - Schedules specific follow-up for new complaint
   - Sets first check at 80% of SLA time
   - Creates unique job ID per complaint

**Lifecycle**:
- **Startup**: Initialized in `app.main:lifespan()`
- **Shutdown**: Gracefully stopped on app shutdown

---

## 🚀 Deployment

### Production Deployment on Render

#### 1. Prepare for Deployment

**Create `render.yaml`** in backend directory:

```yaml
services:
  - type: web
    name: civicagent-api
    env: python
    region: oregon
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: BREVO_API_KEY
        sync: false
      - key: BREVO_SENDER_EMAIL
        sync: false
      - key: JWT_SECRET_KEY
        generateValue: true
```

#### 2. Deploy to Render

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Backend ready for deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select `backend` folder as root directory

3. **Configure Environment**:
   - Add all environment variables from `.env`
   - Set `DEBUG=False`
   - Use strong `JWT_SECRET_KEY`

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for build to complete
   - Note your API URL: `https://civicagent-api.onrender.com`

#### 3. Update Frontend

In frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://civicagent-api.onrender.com
```

### Production Considerations

#### Performance Optimization

1. **Use Production-Grade Server**:
   ```bash
   # Install gunicorn
   pip install gunicorn

   # Start with multiple workers
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Enable Caching** (Redis):
   ```python
   # Add to requirements.txt
   redis
   fastapi-cache2
   ```

3. **Database Connection Pooling**:
   - Configure Supabase connection limits
   - Use pgBouncer for production

#### Security

1. **HTTPS Only**: Render provides free SSL
2. **Rate Limiting**:
   ```python
   from slowapi import Limiter
   
   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   ```

3. **CORS**: Update `settings.CORS_ORIGINS` to production domains only

4. **Secrets Management**:
   - Never commit `.env` file
   - Use Render environment variables
   - Rotate API keys regularly

#### Monitoring

1. **Logging**:
   ```python
   import logging
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
   )
   ```

2. **Health Checks**:
   - Use `/health` endpoint
   - Set up Render health check pings

3. **Error Tracking**:
   ```bash
   pip install sentry-sdk
   ```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Import Errors

**Problem**: `ModuleNotFoundError: No module named 'xxx'`

**Solution**:
```bash
# Ensure environment is activated
conda activate CivicAgent

# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

#### 2. Supabase Connection Errors

**Problem**: `supabase.exceptions.AuthError`

**Solution**:
- Verify `SUPABASE_URL` and keys in `.env`
- Check Supabase project is not paused (free tier)
- Ensure service role key has correct permissions

#### 3. Gemini API Errors

**Problem**: `google.api_core.exceptions.PermissionDenied: 403 Unauthorized`

**Solution**:
- Verify `GEMINI_API_KEY` is valid
- Check API quota in Google AI Studio
- Ensure Gemini API is enabled for your project

#### 4. Scheduler Not Running

**Problem**: Follow-ups not being sent

**Solution**:
```python
# Check scheduler status
from app.services.scheduler import get_scheduler
scheduler = get_scheduler()
print(scheduler.get_jobs())

# Verify timezone
print(scheduler.timezone)
```

#### 5. Email Not Sending

**Problem**: Brevo emails failing

**Solution**:
- Verify `BREVO_API_KEY` is correct
- Check sender email is verified in Brevo dashboard
- Review Brevo logs in dashboard
- Check free tier limits (300 emails/day)

#### 6. Decision Model Errors

**Problem**: `FileNotFoundError: models/decision_model.pkl`

**Solution**:
```bash
# Manually train model
python -c "from app.services.decision_model import decision_model; decision_model.train()"

# Verify models directory exists
ls models/
```

#### 7. Image Upload Failures

**Problem**: Images not uploading to Supabase Storage

**Solution**:
- Verify `complaint-images` bucket exists
- Check bucket is set to **Public**
- Verify storage policies allow uploads
- Check file size (max 10MB)

#### 8. CORS Errors

**Problem**: Browser blocks API requests

**Solution**:
```python
# Update CORS_ORIGINS in .env (supports multiple ports)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-frontend.vercel.app

# Or in code (app/core/config.py)
CORS_ORIGINS = ["*"]  # Allow all (dev only!)
```

**Note**: Next.js may use port 3001 if 3000 is already in use.

### Debug Mode

Enable debug logging:

```env
# .env
DEBUG=True
```

```python
# app/main.py
logging.basicConfig(level=logging.DEBUG)
```

### Testing API Endpoints

Using `curl`:

```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Create complaint (with file)
curl -X POST http://localhost:8000/complaints/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "category=Pothole" \
  -F "description=Large pothole" \
  -F "latitude=28.6139" \
  -F "longitude=77.2090" \
  -F "image=@/path/to/image.jpg"
```

Using **Swagger UI**:
- Navigate to http://localhost:8000/docs
- Click "Authorize" button
- Enter Bearer token
- Test endpoints interactively

---

## 📞 Support

### Resources

- **API Documentation**: http://localhost:8000/docs
- **Supabase Docs**: https://supabase.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Gemini API Docs**: https://ai.google.dev/docs

### Getting Help

1. **Check Logs**: Review server logs for error messages
2. **Verify Environment**: Ensure all env variables are set
3. **Test Endpoints**: Use Swagger UI to test API
4. **Database Check**: Verify schema is up to date

---

## 📝 License

[Specify License]

---

## 🙏 Acknowledgments

- **FastAPI** - Modern Python web framework
- **Google Gemini** - AI vision and reasoning models
- **Supabase** - Backend infrastructure
- **Brevo** - Email delivery service
- **SHAP** - Explainable AI library

---

**Built with ❤️ for better communities** 🏙️

**Team ByteOrbit** | Hackarena 2025
