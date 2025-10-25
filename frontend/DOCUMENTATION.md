# CivicAgent Frontend - Complete Documentation

> **A modern, responsive web application for reporting and tracking civic issues**  
> Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Quick Start](#quick-start)
6. [Project Structure](#project-structure)
7. [Navigation & Routing](#navigation--routing)
8. [Components Guide](#components-guide)
9. [State Management](#state-management)
10. [Database Setup](#database-setup)
11. [Development](#development)
12. [Deployment](#deployment)
13. [Contributing](#contributing)
14. [Troubleshooting](#troubleshooting)

---

## Overview

CivicAgent is a citizen-centric web application designed to bridge the gap between citizens and local government. It empowers users to report civic issues (potholes, garbage dumps, broken streetlights, etc.) and transparently track their resolution through an AI-powered automated system.

### 🎯 Project Vision

- **Transparency**: All reported issues are publicly visible on an interactive map
- **Accountability**: Complete timeline tracking of actions taken on each complaint
- **Accessibility**: Mobile-first responsive design for all devices
- **Simplicity**: Intuitive multi-step form for easy issue reporting

---

## Features

### 🔐 User Authentication
- Secure signup and login with Supabase Auth
- Email/password authentication
- Session management with automatic token refresh
- Protected routes for authenticated users

### 📝 Issue Reporting
Multi-step complaint submission form with:
- **Image Upload**: Take photo or upload from device with preview
- **GPS Location**: Auto-detect location or manually adjust on interactive map
- **Issue Categories**: Predefined types (Pothole, Garbage, Lighting, etc.)
- **Detailed Description**: Add landmarks and comprehensive details

### 📊 Status Tracking
- Real-time timeline showing complaint progress
- Color-coded status indicators:
  - 🟢 **Submitted**: Initial submission
  - 🟡 **In Progress**: Being worked on
  - 🔵 **Resolved**: Issue fixed
  - 🔴 **Rejected**: Cannot be addressed
- Action history with timestamps

### 🗺️ Public Dashboard
- Interactive Leaflet map displaying all reported issues
- Color-coded markers based on status
- Click markers to view details
- Statistics cards showing issue counts
- Filter by status and category

### 🎨 Dark Mode
- System-aware theme detection
- Manual theme toggle in navbar
- Persistent theme preference
- Smooth transitions between themes

### 📱 Responsive Design
- Mobile-first approach
- Optimized for all screen sizes (320px to 4K)
- Touch-friendly interactions
- Hamburger menu for mobile navigation

---

## Tech Stack

### Frontend Framework
- **Next.js 14.2+** - React framework with App Router
- **React 18.3+** - UI library
- **TypeScript 5.3+** - Type-safe JavaScript

### Styling & UI
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **Shadcn/ui** - Accessible component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Beautiful icon set
- **next-themes** - Dark mode support

### State & Data
- **Zustand 4.5+** - Lightweight state management
- **Supabase Client 2.39+** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Storage for images
  - Real-time subscriptions

### Maps & Geolocation
- **Leaflet 1.9+** - Interactive maps
- **react-leaflet 4.2+** - React components for Leaflet
- Browser Geolocation API

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js LTS** (v18.17.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- ✅ **npm** (comes with Node.js)
  - Verify: `npm --version`

- ✅ **Git** (for version control)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

- ✅ **Git Bash** (Windows users only)
  - Included with Git for Windows
  - Use for all terminal commands (NOT PowerShell or CMD)

- ✅ **Supabase Account**
  - Sign up at [supabase.com](https://supabase.com/)
  - Free tier available

- ✅ **Code Editor** (recommended)
  - VS Code with extensions:
    - ESLint
    - Tailwind CSS IntelliSense
    - TypeScript and JavaScript Language Features

---

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ByteOrbit-Hackarena2025/frontend
```

### 2. Install Dependencies

**IMPORTANT**: Use Git Bash on Windows, not PowerShell or CMD

```bash
npm install
```

This installs all required packages (~5 minutes on first run):
- Next.js, React, TypeScript
- Tailwind CSS and PostCSS
- Supabase client
- Leaflet maps
- UI components
- And all other dependencies

### 3. Set Up Supabase

#### Create a Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: CivicAgent
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Wait for provisioning (~2 minutes)

#### Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 4. Configure Environment Variables

The `.env.local` file already exists in the frontend directory. Open it and update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace with your actual credentials from Step 3!**

### 5. Set Up Database Tables

#### Create Complaints Table

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste:

```sql
-- Complaints table
create table complaints (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  description text not null,
  landmark text,
  latitude decimal not null,
  longitude decimal not null,
  image_url text,
  status text default 'submitted',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table complaints enable row level security;

-- Policies: Anyone can view, users can insert/update their own
create policy "Anyone can view complaints"
  on complaints for select
  using (true);

create policy "Users can insert their own complaints"
  on complaints for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own complaints"
  on complaints for update
  using (auth.uid() = user_id);
```

4. Click **Run**

#### Create Complaint Actions Table

1. Create another new query
2. Paste:

```sql
-- Complaint actions/timeline table
create table complaint_actions (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references complaints(id) on delete cascade not null,
  action_type text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table complaint_actions enable row level security;

-- Policy: Anyone can view actions
create policy "Anyone can view complaint actions"
  on complaint_actions for select
  using (true);
```

3. Click **Run**

#### Create Storage Bucket

1. In Supabase, go to **Storage**
2. Click **New bucket**
3. Name: `complaint-images`
4. Toggle **Public bucket** ON
5. Click **Create bucket**

6. Click on the bucket → **Policies** tab
7. Click **New Policy** → **Custom**
8. Paste:

```sql
-- Upload policy
create policy "Anyone can upload complaint images"
  on storage.objects for insert
  with check (bucket_id = 'complaint-images');

-- View policy
create policy "Anyone can view complaint images"
  on storage.objects for select
  using (bucket_id = 'complaint-images');
```

9. Click **Review** → **Save policy**

### 6. Run the Development Server

```bash
npm run dev
```

You should see:
```
 ✓ Ready in 2.3s
  ○ Local:   http://localhost:3000
```

### 7. Open the Application

Visit [http://localhost:3000](http://localhost:3000) in your browser!

🎉 **You're ready to start developing!**

---

## Project Structure

```
frontend/
│
├── app/                           # Next.js App Router (src-less structure)
│   │
│   ├── (auth)/                    # Authentication route group
│   │   ├── login/
│   │   │   └── page.tsx          # Login page with form
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page with form
│   │   └── layout.tsx            # Auth layout (minimal, no navbar)
│   │
│   ├── (main)/                    # Main application route group
│   │   ├── complaint/[id]/       # Dynamic route for complaint details
│   │   │   └── page.tsx          # Individual complaint view
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Public dashboard with map
│   │   ├── submit/
│   │   │   └── page.tsx          # Complaint submission form
│   │   ├── layout.tsx            # Main layout (includes Navbar + Footer)
│   │   └── page.tsx              # Landing/home page
│   │
│   ├── globals.css               # Global styles + Tailwind directives
│   └── layout.tsx                # Root layout (theme provider, fonts)
│
├── components/                    # React components
│   │
│   ├── ui/                        # Shadcn UI primitives
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card, CardHeader, CardContent
│   │   ├── input.tsx             # Input field
│   │   ├── label.tsx             # Form label
│   │   └── textarea.tsx          # Text area input
│   │
│   ├── navbar.tsx                # ✨ NEW: Navigation bar component
│   ├── footer.tsx                # ✨ NEW: Footer component
│   ├── back-button.tsx           # ✨ NEW: Back navigation button
│   ├── complaint-form.tsx        # Multi-step complaint submission form
│   ├── map-picker.tsx            # Interactive location picker map
│   ├── map-view.tsx              # Dashboard map with markers
│   ├── status-timeline.tsx       # Complaint action timeline
│   ├── theme-provider.tsx        # Theme context provider
│   └── theme-toggle.tsx          # Dark/light mode toggle
│
├── lib/                           # Utilities and helpers
│   ├── supabase.ts               # Supabase client + TypeScript types
│   ├── store.ts                  # Zustand global state store
│   └── utils.ts                  # Helper functions (cn, etc.)
│
├── public/                        # Static assets (images, favicon, etc.)
│
├── .env.local                     # Environment variables (GITIGNORED)
├── .env.local.example            # Environment template
├── .gitignore                    # Git ignore rules
├── .vscode/settings.json         # VS Code workspace settings
├── components.json               # Shadcn UI configuration
├── database_schema.sql           # Complete database setup SQL
├── next.config.mjs               # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── README.md                     # This file
├── setup.sh                      # Automated setup script (Linux/Mac)
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## Navigation & Routing

### How Navigation Works

The app uses **Next.js App Router** with client-side navigation for instant page transitions. The browser's back/forward/reload buttons work perfectly!

#### Navigation Components

1. **Navbar** (`components/navbar.tsx`)
   - Sticky header at top of every page
   - Links to: Home, Dashboard, Submit Issue
   - Login/Signup buttons (when logged out)
   - User email + Sign Out (when logged in)
   - Theme toggle
   - Mobile hamburger menu

2. **Footer** (`components/footer.tsx`)
   - Appears at bottom of every page
   - Quick links to main pages
   - About section
   - Copyright info

3. **BackButton** (`components/back-button.tsx`)
   - Appears on complaint detail pages
   - Can navigate to specific URL or use browser history
   - Usage:
     ```tsx
     <BackButton href="/dashboard" label="Back to Dashboard" />
     <BackButton /> // Uses browser back()
     ```

#### Browser Navigation Support

✅ **Back button**: Returns to previous page  
✅ **Forward button**: Goes to next page in history  
✅ **Reload button**: Refreshes current page  
✅ **Bookmarks**: All pages can be bookmarked  
✅ **Direct URLs**: Can navigate directly to any page

#### Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing page | Public |
| `/login` | Login form | Public only |
| `/signup` | Signup form | Public only |
| `/dashboard` | Map dashboard | Public |
| `/submit` | Submit complaint | Requires auth |
| `/complaint/[id]` | Complaint details | Public |

#### Protected Routes

The `/submit` page requires authentication. If a user tries to access it while logged out:
1. They're redirected to `/login`
2. After login, they're redirected back to `/submit`

---

## Components Guide

### UI Components (`components/ui/`)

These are Shadcn/ui primitives built on Radix UI:

#### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Input
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="Enter email" />
```

### Feature Components

#### ComplaintForm (`components/complaint-form.tsx`)

Multi-step form for submitting complaints:

**Step 1**: Image Upload
- Drag & drop or click to upload
- Preview uploaded image
- File validation (JPEG, PNG, max 5MB)

**Step 2**: Location Selection
- "Use My Location" button (browser geolocation)
- Interactive map to adjust location
- Displays coordinates

**Step 3**: Details
- Category dropdown (Pothole, Garbage, etc.)
- Landmark text input
- Description textarea

**Props**:
```tsx
interface ComplaintFormProps {
  onSubmit: (data: ComplaintData) => void;
  onCancel: () => void;
}
```

#### MapView (`components/map-view.tsx`)

Dashboard map with all complaints:

```tsx
import { MapView } from '@/components/map-view';

<MapView 
  complaints={complaints}
  onMarkerClick={(complaint) => router.push(`/complaint/${complaint.id}`)}
/>
```

**Features**:
- Color-coded markers by status
- Popup on marker click
- Zoom controls
- Responsive sizing

#### MapPicker (`components/map-picker.tsx`)

Interactive location picker:

```tsx
import MapPicker from '@/components/map-picker';

<MapPicker
  center={[latitude, longitude]}
  onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
/>
```

**Features**:
- Draggable marker
- Click to set location
- Current location button
- Zoom controls

#### StatusTimeline (`components/status-timeline.tsx`)

Displays complaint action history:

```tsx
import { StatusTimeline } from '@/components/status-timeline';

<StatusTimeline actions={complaintActions} />
```

**Features**:
- Chronological timeline
- Action type icons
- Timestamps
- Descriptions

#### ThemeToggle (`components/theme-toggle.tsx`)

Dark/light mode toggle:

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

<ThemeToggle />
```

**Features**:
- Sun/moon icons
- Tooltip on hover
- Persists preference
- Respects system theme

---

## State Management

### Zustand Store (`lib/store.ts`)

Global authentication state:

```typescript
import { useAuthStore } from '@/lib/store';

function Component() {
  const { user, loading, signOut, checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth(); // Check session on mount
  }, [checkAuth]);
  
  if (loading) return <div>Loading...</div>;
  
  return user ? (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  ) : (
    <div>Please log in</div>
  );
}
```

**State**:
- `user`: Current user object (from Supabase) or null
- `loading`: Boolean for loading state
- `setUser`: Set current user
- `setLoading`: Set loading state
- `signOut`: Sign out and clear user
- `checkAuth`: Check if user is authenticated

---

## Database Setup

### Complete Schema

See `database_schema.sql` for the full SQL script.

### Tables

#### 1. `complaints`
Stores all reported issues.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users |
| `category` | text | Issue type (Pothole, Garbage, etc.) |
| `description` | text | Detailed description |
| `landmark` | text | Nearby landmark |
| `latitude` | decimal | GPS latitude |
| `longitude` | decimal | GPS longitude |
| `image_url` | text | URL to uploaded image |
| `status` | text | Current status (submitted/in-progress/resolved/rejected) |
| `created_at` | timestamp | Created timestamp |
| `updated_at` | timestamp | Last updated timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key on `user_id`
- Index on `status` for filtering

**Row Level Security**:
- SELECT: Public (anyone can view)
- INSERT: Authenticated users only
- UPDATE: Complaint owner only

#### 2. `complaint_actions`
Tracks history of actions taken on complaints.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `complaint_id` | uuid | Foreign key to complaints |
| `action_type` | text | Type of action (submitted, escalated, resolved, etc.) |
| `description` | text | Action description |
| `created_at` | timestamp | When action occurred |

**Cascade Delete**: Actions deleted when complaint is deleted

**Row Level Security**:
- SELECT: Public (anyone can view)
- INSERT: Backend/admin only (future feature)

#### 3. Storage Bucket: `complaint-images`
Stores uploaded complaint images.

**Settings**:
- Public: Yes (images accessible via URL)
- File size limit: 5MB
- Allowed types: image/jpeg, image/png, image/webp

**Policies**:
- Upload: Anyone (authenticated users via client)
- View: Anyone (public URLs)

---

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type check
npm run type-check
```

### Development Server

```bash
npm run dev
```

- Runs on [http://localhost:3000](http://localhost:3000)
- Hot module replacement (instant updates)
- Error overlay in browser
- API routes on `/api/*`

### Building for Production

```bash
npm run build
```

- Optimizes and minifies code
- Generates static pages where possible
- Creates production bundle in `.next/`
- Runs type checking

### Code Style

#### TypeScript Best Practices

✅ **DO**:
```typescript
// Explicit types
interface User {
  id: string;
  email: string;
}

// Proper typing
const fetchUser = async (id: string): Promise<User> => {
  // ...
};
```

❌ **DON'T**:
```typescript
// Avoid 'any'
const data: any = fetchData();

// Avoid implicit types
const fetchUser = async (id) => {
  // ...
};
```

#### React Best Practices

✅ **DO**:
```typescript
// Functional components with props typing
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// Custom hooks for logic
function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  // ...
  return { complaints, loading, error };
}
```

❌ **DON'T**:
```typescript
// Avoid class components
class Button extends React.Component {
  // ...
}

// Avoid inline props typing
export function Button(props: any) {
  // ...
}
```

### File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `ComplaintForm.tsx`)
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Types**: `types.ts` or inline in component files

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/add-complaint-filters

# Make changes and commit
git add .
git commit -m "feat: add status filter to dashboard"

# Push to remote
git push origin feature/add-complaint-filters

# Create pull request on GitHub
```

**Commit Message Format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build/config changes

---

## Deployment

### Vercel (Recommended)

**Why Vercel?**
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- Edge network (fast globally)
- Free tier generous

**Steps**:

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "chore: prepare for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Set root directory: `frontend`

3. **Configure**
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build`
   - Output directory: `.next`

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
   ```
   
   **⚠️ IMPORTANT**: Use PRODUCTION Supabase credentials!

5. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Visit your live URL!

6. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your domain
   - Update DNS records as shown
   - SSL automatic

### Netlify

**Steps**:

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import existing project"
   - Connect GitHub

2. **Configure Build**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`

3. **Environment Variables**
   Same as Vercel (production Supabase credentials)

4. **Deploy**
   - Click "Deploy site"
   - Wait for build
   - Visit site URL

### Self-Hosting (VPS)

For custom server deployment:

**Requirements**:
- Ubuntu 20.04+ or similar
- Node.js 18+ LTS
- Nginx or Apache
- PM2 (process manager)

**Steps**:

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and Build**
   ```bash
   git clone <repo-url>
   cd ByteOrbit-Hackarena2025/frontend
   npm install
   npm run build
   ```

3. **Set Environment Variables**
   ```bash
   nano .env.local
   # Add production credentials
   ```

4. **Install PM2**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "civicagent" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
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

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful: `npm run build`
- [ ] Linting passing: `npm run lint`
- [ ] Responsive design verified (mobile to desktop)
- [ ] Dark mode tested
- [ ] Production Supabase project set up
- [ ] Database schema deployed
- [ ] Storage bucket created
- [ ] Environment variables configured
- [ ] `.env.local` in `.gitignore`
- [ ] No sensitive data in code
- [ ] README updated

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Ways to Contribute

- 🐛 **Report bugs** - Create detailed issue reports
- 💡 **Suggest features** - Share your ideas
- 📝 **Improve docs** - Fix typos, add examples
- 🎨 **Enhance UI/UX** - Design improvements
- 🔧 **Fix issues** - Submit pull requests
- ✅ **Write tests** - Increase code coverage

### Getting Started

1. **Fork the repository**
   - Click "Fork" on GitHub
   - Clone your fork locally

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes**
   - Follow code style guidelines
   - Write meaningful commit messages
   - Test your changes

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Go to GitHub and create Pull Request
   - Describe your changes
   - Link related issues

### Code Style Guidelines

- Use TypeScript for all new files
- Follow existing file structure
- Use functional components and hooks
- Add TypeScript types/interfaces
- Keep components small and focused
- Extract reusable logic into hooks
- Use meaningful variable names
- Add comments for complex logic
- Run `npm run lint` before committing

### Commit Message Format

```
type(scope): subject

body

footer
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build/config

**Example**:
```
feat(dashboard): add status filter dropdown

- Add filter component
- Connect to map markers
- Update URL params
- Add tests

Closes #123
```

### Pull Request Guidelines

- Keep PRs focused on single feature/fix
- Update documentation if needed
- Add tests if applicable
- Ensure all checks pass
- Request review from maintainers

---

## Troubleshooting

### Common Issues

#### 1. npm is not recognized

**Problem**: Terminal doesn't recognize npm command

**Solution**:
- **Windows**: Close and reopen terminal after installing Node.js
- Use Git Bash instead of PowerShell/CMD
- Verify installation: `node -v` and `npm -v`
- Add Node.js to PATH manually if needed

#### 2. Module not found errors (444 errors)

**Problem**: Cannot find module 'react', 'next', etc.

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Supabase connection failed

**Problem**: "Failed to connect to Supabase"

**Solution**:
- Check `.env.local` has correct credentials
- Ensure no extra spaces in environment variables
- Verify Supabase project is active
- Restart dev server: `npm run dev`

#### 4. Geolocation not working

**Problem**: "Geolocation is not supported" or permission denied

**Solution**:
- Use HTTPS in production (localhost is fine for dev)
- Grant location permission when browser prompts
- If blocked, manually set location on map
- Check browser settings allow geolocation

#### 5. Map not displaying

**Problem**: Map container is blank or shows error

**Solution**:
- This is normal on first load (SSR issue)
- Map loads dynamically on client side
- Check browser console for specific errors
- Ensure Leaflet CSS is loading
- Try clearing browser cache

#### 6. Image upload fails

**Problem**: "Failed to upload image"

**Solution**:
- Ensure storage bucket exists: `complaint-images`
- Verify bucket is public
- Check storage policies are set correctly
- File size must be under 5MB
- Only JPEG/PNG/WebP allowed

#### 7. Dark mode not persisting

**Problem**: Theme resets to light on page reload

**Solution**:
- Clear browser cookies and cache
- Check browser allows localStorage
- Verify `ThemeProvider` is in root layout
- Try in incognito mode to rule out extensions

#### 8. Build errors

**Problem**: `npm run build` fails

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

#### 9. TypeScript errors in VS Code

**Problem**: Red squiggly lines everywhere

**Solution**:
- Ensure TypeScript extension is installed
- Reload VS Code window: `Ctrl+Shift+P` → "Reload Window"
- Check `tsconfig.json` is correct
- Run `npm install` to get type definitions
- Close and reopen specific files

#### 10. Tailwind CSS not working

**Problem**: Tailwind classes not applying styles

**Solution**:
- Check `tailwind.config.ts` content paths include your files
- Verify `postcss.config.js` exists
- Ensure `@tailwind` directives are in `globals.css`
- Restart dev server
- Clear browser cache

### Getting Help

If you're still stuck:

1. **Check the documentation**
   - README.md (this file)
   - QUICKSTART.md
   - PROJECT_OVERVIEW.md

2. **Search existing issues**
   - Check GitHub Issues
   - Search Supabase docs
   - Search Next.js docs

3. **Ask for help**
   - Create a GitHub Issue
   - Include error messages
   - Describe what you tried
   - Share relevant code snippets

4. **Useful Resources**
   - [Next.js Docs](https://nextjs.org/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Tailwind CSS Docs](https://tailwindcss.com/docs)
   - [React Docs](https://react.dev)
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## License

This project is part of Hackarena 2025.

---

## Acknowledgments

- **Next.js** - Amazing React framework
- **Supabase** - Incredible BaaS platform
- **Shadcn** - Beautiful accessible components
- **Leaflet** - Best open-source mapping library
- **Vercel** - Excellent hosting platform

---

**Built with ❤️ for Hackarena 2025**

For questions or support, please open an issue on GitHub.
