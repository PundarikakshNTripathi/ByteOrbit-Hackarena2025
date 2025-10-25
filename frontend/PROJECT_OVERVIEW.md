# CivicAgent Frontend - Project Overview

## 🎯 Project Vision

CivicAgent is a citizen-centric web application designed to bridge the gap between citizens and local government. It empowers users to report civic issues (potholes, garbage dumps, broken streetlights, etc.) and transparently track their resolution through an AI-powered automated system.

## 🏗️ Architecture

### Tech Stack

```
Frontend Layer
├── Framework: Next.js 14 (App Router)
├── Language: TypeScript
├── Styling: Tailwind CSS
├── UI Library: Shadcn/ui
├── State Management: Zustand
└── Maps: Leaflet.js

Backend Layer (Supabase)
├── Authentication: Supabase Auth
├── Database: PostgreSQL (via Supabase)
├── Storage: Supabase Storage
└── Real-time: Supabase Realtime

Infrastructure
├── Hosting: Vercel/Netlify (recommended)
├── Database: Supabase Cloud
└── CDN: Automatic (via hosting platform)
```

## 📂 Project Structure

```
frontend/
│
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/               # Login page
│   │   │   └── page.tsx
│   │   ├── signup/              # Signup page
│   │   │   └── page.tsx
│   │   └── layout.tsx           # Auth layout
│   │
│   ├── (main)/                  # Main app route group
│   │   ├── complaint/[id]/      # Dynamic complaint detail
│   │   │   └── page.tsx
│   │   ├── dashboard/           # Public dashboard
│   │   │   └── page.tsx
│   │   ├── submit/              # Complaint submission
│   │   │   └── page.tsx
│   │   ├── layout.tsx           # Main layout (navbar + footer)
│   │   └── page.tsx             # Landing page
│   │
│   ├── globals.css              # Global styles & Tailwind
│   └── layout.tsx               # Root layout
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   │
│   ├── complaint-form.tsx       # Multi-step form
│   ├── map-picker.tsx           # Location picker
│   ├── map-view.tsx             # Dashboard map
│   ├── status-timeline.tsx      # Action timeline
│   ├── theme-provider.tsx       # Theme context
│   └── theme-toggle.tsx         # Dark mode toggle
│
├── lib/                         # Utilities & helpers
│   ├── supabase.ts             # Supabase client & types
│   ├── store.ts                # Zustand global state
│   └── utils.ts                # Helper functions
│
├── public/                      # Static assets
│
├── .env.local                   # Environment variables
├── .env.local.example          # Environment template
├── .gitignore                  # Git ignore rules
├── components.json             # Shadcn config
├── database_schema.sql         # Database setup SQL
├── next.config.mjs             # Next.js config
├── package.json                # Dependencies
├── postcss.config.js           # PostCSS config
├── QUICKSTART.md               # Quick setup guide
├── README.md                   # Main documentation
├── setup.sh                    # Setup script
├── tailwind.config.ts          # Tailwind config
└── tsconfig.json               # TypeScript config
```

## 🔄 Data Flow

### 1. User Registration & Authentication

```
User → Signup Form → Supabase Auth → Session Created → User Dashboard
```

### 2. Complaint Submission

```
User → Multi-step Form
  ├── Step 1: Upload Image → Supabase Storage
  ├── Step 2: Set Location → Browser Geolocation API
  └── Step 3: Add Details → Submit

Submit → Supabase Database (complaints table)
       → Create Initial Action (complaint_actions table)
       → Redirect to Dashboard
```

### 3. Viewing Dashboard

```
User → Dashboard Page
     → Fetch Complaints (Supabase)
     → Render Map with Markers (Leaflet)
     → Display Statistics
```

### 4. Tracking Complaint Status

```
User → Click Complaint
     → Fetch Details (complaints table)
     → Fetch Actions (complaint_actions table)
     → Render Timeline
     → Display on Map
```

## 🎨 Design System

### Color Palette

```css
/* Light Mode */
Primary: Blue (#3b82f6)
Secondary: Gray (#6b7280)
Success: Green (#22c55e)
Warning: Yellow (#eab308)
Error: Red (#ef4444)
Background: White (#ffffff)

/* Dark Mode */
Primary: Light Blue (#60a5fa)
Secondary: Light Gray (#9ca3af)
Success: Light Green (#4ade80)
Warning: Light Yellow (#fbbf24)
Error: Light Red (#f87171)
Background: Dark Gray (#0f172a)
```

### Typography

```css
Font Family: Inter (from Google Fonts)
Headings: Bold, varying sizes (2xl to 7xl)
Body: Normal weight, sm to lg
```

### Responsive Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

## 🔐 Security Considerations

### Row Level Security (RLS)

```sql
-- Users can view all complaints (transparency)
SELECT: Anyone

-- Users can only create their own complaints
INSERT: auth.uid() = user_id

-- Users can only update their own complaints
UPDATE: auth.uid() = user_id
```

### Environment Variables

```bash
# Never commit these to Git!
NEXT_PUBLIC_SUPABASE_URL      # Public - safe in client
NEXT_PUBLIC_SUPABASE_ANON_KEY # Public - safe in client
SUPABASE_SERVICE_ROLE_KEY     # Private - server only!
```

### Authentication Flow

```
1. User signs up → Supabase creates user in auth.users
2. User logs in → Supabase creates session
3. Session stored in cookie (httpOnly, secure)
4. Every request includes session token
5. Supabase validates token and enforces RLS
```

## 🚀 Deployment

### Recommended Platforms

1. **Vercel** (Easiest for Next.js)
   - Automatic builds from Git
   - Edge functions support
   - Built-in analytics

2. **Netlify**
   - Simple deployment
   - Good CI/CD pipeline
   - Form handling built-in

### Deployment Checklist

- [ ] Set up production Supabase project
- [ ] Configure environment variables in hosting platform
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic on Vercel/Netlify)
- [ ] Set up database backups in Supabase
- [ ] Configure CORS if needed
- [ ] Test all features in production
- [ ] Set up monitoring (Sentry, LogRocket, etc.)

## 📊 Database Schema

### complaints

| Column      | Type      | Description                    |
|-------------|-----------|--------------------------------|
| id          | uuid      | Primary key                    |
| user_id     | uuid      | Foreign key to auth.users      |
| category    | text      | Issue type                     |
| description | text      | Detailed description           |
| landmark    | text      | Nearby landmark                |
| latitude    | decimal   | GPS latitude                   |
| longitude   | decimal   | GPS longitude                  |
| image_url   | text      | URL to uploaded image          |
| status      | text      | Current status                 |
| created_at  | timestamp | When created                   |
| updated_at  | timestamp | When last updated              |

### complaint_actions

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | uuid      | Primary key                    |
| complaint_id | uuid      | Foreign key to complaints      |
| action_type  | text      | Type of action                 |
| description  | text      | Action details                 |
| created_at   | timestamp | When action occurred           |

## 🧪 Testing Strategy

### Manual Testing Checklist

- [ ] User can sign up with email/password
- [ ] User can log in
- [ ] User can log out
- [ ] Protected routes redirect to login
- [ ] Image upload works
- [ ] Geolocation detection works
- [ ] Manual map location selection works
- [ ] Form validation works on all steps
- [ ] Complaint submission saves to database
- [ ] Dashboard loads and displays map
- [ ] Map markers are color-coded correctly
- [ ] Clicking marker shows popup
- [ ] Complaint detail page loads
- [ ] Timeline displays correctly
- [ ] Theme toggle works
- [ ] Mobile responsive design works
- [ ] Dark mode works throughout app

### Automated Testing (Future)

```bash
# Unit tests
npm run test

# E2E tests with Playwright
npm run test:e2e

# Component tests
npm run test:component
```

## 🔮 Future Enhancements

1. **Real-time Updates**
   - Use Supabase Realtime for live complaint updates
   - WebSocket notifications for status changes

2. **Advanced Filtering**
   - Filter by category, status, date range
   - Search by keyword or location

3. **Analytics Dashboard**
   - Resolution time metrics
   - Issue frequency heatmaps
   - Department performance tracking

4. **Mobile App**
   - React Native version
   - Push notifications
   - Offline support

5. **AI Integration**
   - Automatic issue categorization
   - Duplicate detection
   - Priority scoring

## 📞 Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Leaflet Documentation](https://leafletjs.com)

## 🤝 Contributing

See the main README.md for contribution guidelines.

## 📄 License

Part of Hackarena 2025 project.

---

Built with ❤️ for better communities
