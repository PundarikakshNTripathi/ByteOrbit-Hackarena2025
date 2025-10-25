# CivicAgent - AI-Powered Civic Engagement Platform# CivicAgent - Hackarena 2025 Project



**Hackarena 2025 Project** | Team ByteOrbit## 🎯 Project Summary



---**CivicAgent** is an AI-powered civic engagement platform that enables citizens to report and track municipal issues (potholes, garbage dumps, broken streetlights, etc.) with complete transparency. The system automatically follows up with local authorities and escalates issues when necessary, ensuring timely resolution.



## 🎯 Overview## 🌟 Key Features



**CivicAgent** is an AI-powered civic engagement platform that enables citizens to report and track municipal issues with complete transparency. The system uses artificial intelligence to automatically categorize complaints, provides comprehensive admin tools, and ensures timely resolution.### 🏠 Featured on Homepage

All AI and Admin features are now prominently showcased on the landing page with:

### What Makes It Special- **"Now with AI-Powered Analysis"** badge

- **Dedicated AI features section** with 4 feature cards

- 🤖 **AI-Powered**: Automatic issue detection and categorization from uploaded images (85-99% confidence)- **Clear authentication requirements** (lock icons + notices)

- 🛡️ **Admin Dashboard**: Real-time statistics and complaint management- **"NEW" badges** on all AI features

- ⭐ **User Feedback**: 5-star rating system for resolved issues- **Call-to-action** encouraging users to sign up

- 🗺️ **Interactive Maps**: Visual representation of all civic issues

- 📊 **Complete Transparency**: Public tracking of all complaints and resolutions### For Citizens

- 📸 **Easy Reporting**: Multi-step form with image upload and GPS location

---- 🤖 **AI-Powered Analysis**: Automatic issue detection and categorization from uploaded images

- 🗺️ **Interactive Dashboard**: View all reported issues on a map

## 🌟 Key Features- 📊 **Status Tracking**: Real-time timeline showing resolution progress

- ⭐ **User Feedback**: Rate and review resolved complaints

### For Citizens- 🌙 **Modern Interface**: Beautiful, responsive design with dark mode

- 🔐 **Secure Authentication**: Email-based signup and login

**AI-Powered Submission**

- Upload image → AI detects issue category automatically### For Administrators

- Smart categorization with confidence scores (85-99%)- 🛡️ **Admin Dashboard**: Comprehensive overview with real-time statistics

- Confirm or change AI suggestions- 📋 **Complaint Management**: Search, filter, and update complaint status

- Multi-step guided form (Image → Location → Description)- 🤖 **AI Reports**: View detailed AI analysis and categorization

- 📊 **Analytics Placeholders**: Ready for Civic Intelligence integration (Phase 3)

**Tracking & Feedback**- ⚡ **Status Updates**: Quick status changes with automatic timeline tracking

- Interactive dashboard with all issues on a map

- Real-time status timeline## 📁 Repository Structure

- Rate resolved complaints (5-star system)

- Add feedback comments```

ByteOrbit-Hackarena2025/

**User Experience**└── frontend/                    # Next.js Web Application

- Modern, responsive design (mobile-first)    ├── app/                     # App Router pages

- Dark/light mode support    ├── components/              # React components

- GPS auto-detection    ├── lib/                     # Utilities and helpers

- Secure authentication    ├── public/                  # Static assets

    ├── FRONTEND_DOCUMENTATION.md # Complete frontend documentation

### For Administrators    ├── database_schema.sql      # Supabase database setup

    └── setup.sh                 # Automated setup script

**Dashboard & Analytics**```

- Real-time statistics (Total, Submitted, In Progress, Escalated, Resolved)

- Searchable complaints table## 🚀 Quick Start

- Status filters and badges

- Civic Intelligence placeholders (ready for Phase 3)### ⚠️ IMPORTANT: See the New Features!



**Complaint Management****The AI features and Admin Dashboard require database migration!**

- View detailed AI analysis reports

- Update complaint status with dropdown👉 **[READ THIS FIRST: QUICK_START_GUIDE.md](./frontend/QUICK_START_GUIDE.md)** 👈

- Automatic timeline tracking

- View user feedbackThis guide explains:

- Search and filter capabilities- Why you don't see the new features yet

- How to migrate your database (5 minutes)

---- How to test AI analysis

- How to access the admin dashboard

## 🚀 Quick Start- Common issues and solutions



### Prerequisites### Prerequisites

- Node.js 18+ LTS

- Node.js 18+ LTS- Git Bash (Windows) or Terminal (Mac/Linux)

- Supabase account (free tier)- Supabase account (free tier works)

- Git

### Installation (5 minutes)

### Installation (5 Minutes)

1. **Clone the repository**

1. **Clone Repository**   ```bash

   ```bash   git clone https://github.com/PundarikakshNTripathi/ByteOrbit-Hackarena2025.git

   git clone https://github.com/PundarikakshNTripathi/ByteOrbit-Hackarena2025.git   cd ByteOrbit-Hackarena2025/frontend

   cd ByteOrbit-Hackarena2025/frontend   ```

   ```

2. **Run setup script**

2. **Install Dependencies**   ```bash

   ```bash   bash setup.sh

   npm install   ```

   ```   Or manually:

   ```bash

3. **Configure Environment**   npm install

      ```

   Create `frontend/.env.local`:

   ```env3. **Configure environment**

   NEXT_PUBLIC_SUPABASE_URL=your_project_url   - Create a Supabase project at https://supabase.com

   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key   - Update `frontend/.env.local` with your credentials:

   ```     ```env

     NEXT_PUBLIC_SUPABASE_URL=your_project_url

4. **Setup Database**     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

        ```

   a. Create Supabase project at https://supabase.com

   4. **Setup database**

   b. Open SQL Editor and run the complete SQL from:   - Run the SQL in `frontend/database_schema.sql` in Supabase SQL Editor

   ```   - **IMPORTANT:** If you already have a database, run the migration script in Section 7 of the schema file

   frontend/database_schema.sql   - Create storage bucket named `complaint-images`

   ```

   5. **Start development server**

   c. Create storage bucket:   ```bash

   - Name: `complaint-images`   npm run dev

   - Public: Yes   ```



5. **Start Development**6. **Test the new features**

   ```bash   - Sign up for an account

   npm run dev   - Submit a complaint with an image to see AI analysis

   ```   - Click "Admin" in navbar to access admin dashboard

      - See full guide: [QUICK_START_GUIDE.md](./frontend/QUICK_START_GUIDE.md)

   Visit: http://localhost:3000

## 🛠️ Technology Stack

6. **Test Features**

   - Sign up for an account### Frontend

   - Submit complaint with image- **Framework**: Next.js 14 (App Router)

   - Watch AI detect the category!- **Language**: TypeScript

   - Click "Admin" to see dashboard- **Styling**: Tailwind CSS

- **UI Components**: Shadcn/ui

📖 **Full Documentation**: [`frontend/FRONTEND_DOCUMENTATION.md`](./frontend/FRONTEND_DOCUMENTATION.md)- **State Management**: Zustand

- **Maps**: Leaflet.js

---- **Icons**: Lucide React



## 🛠️ Technology Stack### Backend (Supabase)

- **Database**: PostgreSQL

**Frontend**- **Authentication**: Supabase Auth

- Next.js 14 (App Router)- **Storage**: Supabase Storage

- TypeScript 5.3+- **Real-time**: Supabase Realtime (future)

- Tailwind CSS 3.4+

- Shadcn/ui Components### Infrastructure

- Zustand (State Management)- **Hosting**: Vercel/Netlify (recommended)

- Leaflet.js (Maps)- **Version Control**: Git + GitHub



**Backend (Supabase)**## 📊 Feature Breakdown

- PostgreSQL Database

- Supabase Auth### ✅ Completed Features

- Supabase Storage

- Row Level Security (RLS)#### 1. User Authentication

- [x] Email/password signup

**Infrastructure**- [x] Login and session management

- Vercel (Deployment)- [x] Protected routes

- Git/GitHub- [x] Sign out functionality

- [x] Role-based access (user/admin)

---

#### 2. AI-Powered Complaint Submission

## 📁 Project Structure- [x] Multi-step form (3 steps)

- [x] Image upload with preview

```- [x] **AI Image Analysis**: Automatic issue detection from photos

ByteOrbit-Hackarena2025/- [x] **AI Categorization**: Smart category suggestions with confidence scores

├── frontend/- [x] **AI Confirmation Flow**: Review and confirm AI-detected issues

│   ├── app/- [x] GPS auto-detection

│   │   ├── (auth)/              # Login, Signup- [x] Interactive map for location adjustment

│   │   ├── (main)/              # Public pages- [x] Category selection (with AI pre-fill)

│   │   └── (admin)/             # Admin dashboard- [x] Description and landmark fields

│   ├── components/

│   │   ├── ui/                  # Shadcn components#### 3. Dashboard

│   │   ├── complaint-form.tsx   # AI-powered form- [x] Interactive map with all complaints

│   │   ├── ai-report-display.tsx- [x] Color-coded status markers

│   │   ├── user-feedback.tsx- [x] Statistics cards

│   │   ├── admin-complaints-table.tsx- [x] Responsive design

│   │   └── ...- [x] Admin access button (for logged-in users)

│   ├── lib/

│   │   ├── supabase.ts          # Client & types#### 4. Enhanced Complaint Tracking

│   │   ├── store.ts             # Zustand store- [x] Individual complaint detail pages

│   │   └── utils.ts- [x] Status timeline

│   ├── database_schema.sql      # Complete DB setup- [x] Image display

│   ├── FRONTEND_DOCUMENTATION.md # Full documentation- [x] Location map

│   └── package.json- [x] **AI Report Display**: View AI-detected category, confidence, and analysis

└── README.md                    # This file- [x] **User Feedback System**: Star rating and comments for resolved issues

```- [x] **XAI Placeholder**: Ready for explainable AI integration



---#### 5. Admin Dashboard

- [x] Protected admin routes (`/admin-dashboard`, `/admin-complaints`)

## 📊 Features Checklist- [x] **Real-time Statistics**: Total, Submitted, In Progress, Escalated, Resolved

- [x] **Complaints Table**: Searchable, sortable, with status badges

### ✅ Completed- [x] **Status Management**: Update complaint status with dropdown

- [x] **Detailed View**: Full complaint information with AI reports

**Authentication**- [x] **Action Timeline**: Track all status changes

- [x] Email/password signup- [x] **Civic Intelligence Placeholders**: Ready for analytics integration

- [x] Login/logout

- [x] Protected routes#### 6. UI/UX

- [x] Role-based access (user/admin)- [x] Responsive design (mobile-first)

- [x] Dark mode support

**AI Features**- [x] Modern, clean interface

- [x] AI image analysis (mock, 2-second delay)- [x] Accessibility features

- [x] Category detection (85-99% confidence)- [x] **AI Branding**: Sparkles icons for AI features

- [x] Confirmation workflow- [x] **Badge Components**: Status indicators

- [x] AI report display- [x] **Table Components**: Admin data display

- [x] Category pre-fill

### 🔮 Future Enhancements

**Complaint System**

- [x] Multi-step submission form#### Backend AI Agent (Next Phase)

- [x] Image upload to Supabase Storage- [ ] Real AI model integration (replace mock analysis)

- [x] GPS location detection- [ ] Automated email sending to authorities

- [x] Interactive map picker- [ ] SLA tracking and escalation

- [x] Status timeline- [ ] Follow-up reminders

- [x] User feedback (5-star rating + comments)- [ ] Advanced sentiment analysis



**Admin Dashboard**#### Frontend Improvements

- [x] Real-time statistics- [ ] Real-time updates via WebSockets

- [x] Searchable complaints table- [ ] Advanced filtering and search

- [x] Status management- [ ] Export reports (PDF/CSV)

- [x] AI report viewing- [ ] User profile management

- [x] User feedback viewing- [ ] Notification system

- [x] Action timeline- [ ] Explainable AI (XAI) visualizations

- [ ] Civic Intelligence heatmaps and performance metrics

**UI/UX**

- [x] Responsive design (mobile-first)#### Mobile App

- [x] Dark/light mode- [ ] React Native version

- [x] Homepage AI showcase- [ ] Push notifications

- [x] Authentication notices- [ ] Offline support

- [x] Professional branding

## 📖 Documentation

### 🔮 Planned (Future)

Comprehensive documentation is available in the `frontend/` directory:

**Phase 3 - Civic Intelligence**

- [ ] Real AI model integration**[FRONTEND_DOCUMENTATION.md](./frontend/FRONTEND_DOCUMENTATION.md)** - Complete guide including:

- [ ] Issue heatmap visualization- Installation & Setup

- [ ] Performance metrics- Quick Start Guide

- [ ] Trend analysis- Project Structure

- [ ] Predictive analytics- Navigation System

- Components Reference

**Phase 4 - Advanced Features**- Database Setup

- [ ] Explainable AI (XAI)- Development Guide

- [ ] Real-time notifications- Deployment Instructions

- [ ] Email integration- Contributing Guidelines

- [ ] Mobile app (React Native)- Troubleshooting

- [ ] Export reports (PDF/CSV)

- [ ] Multi-language support## 🎨 Screenshots



---### Landing Page

Modern hero section with clear call-to-action buttons

## 🎨 Screenshots

### Complaint Form

**Homepage**: AI features showcased with "NEW" badges and authentication requirementsIntuitive 3-step process:

1. Upload evidence photo

**AI Analysis**: Upload image → Wait 2 seconds → See detected category with confidence2. Pin location on map

3. Describe the issue

**Admin Dashboard**: Real-time stats, searchable table, status management

### Dashboard

**User Feedback**: 5-star rating system for resolved complaintsInteractive map showing all issues with color-coded markers



---### Status Tracker

Timeline view of all actions taken on a complaint

## 📖 Documentation

## 🔐 Security & Privacy

**Complete Guide**: [`frontend/FRONTEND_DOCUMENTATION.md`](./frontend/FRONTEND_DOCUMENTATION.md)

- **Row Level Security (RLS)**: Database-level access control

This includes:- **Secure Authentication**: Handled by Supabase Auth

- Quick start with database migration- **Public Transparency**: All complaints visible to promote accountability

- Project structure details- **User Privacy**: Email addresses not exposed publicly

- Component documentation

- Database schema explanation## 🚀 Deployment

- AI features guide

- Admin dashboard guide### Vercel (Recommended)

- Troubleshooting

- Deployment instructions1. Push code to GitHub

- Contributing guidelines2. Import project in Vercel

3. Add environment variables

---4. Deploy!



## 🧪 Testing### Netlify



```bash1. Connect GitHub repository

# Run dev server2. Set build command: `npm run build`

npm run dev3. Set publish directory: `.next`

4. Add environment variables

# Build for production5. Deploy!

npm run build

## 🤝 Contributing

# Lint code

npm run lintWe welcome contributions! Please see [frontend/FRONTEND_DOCUMENTATION.md](./frontend/FRONTEND_DOCUMENTATION.md#contributing) for:

```- Code style guidelines

- Pull request process

**Test Scenarios**:- Development workflow

1. Sign up → Submit complaint with image → See AI analysis- Testing requirements

2. View complaint → Check AI report → Submit feedback (if resolved)

3. Login → Click "Admin" → View dashboard → Update status## 📄 Database Schema

4. Search complaints → Filter by status → View details

### Tables

---

**complaints**

## 🚀 Deployment- Stores all reported issues

- Includes location, category, description, status

### Vercel (Recommended)- Links to user and image

- **NEW**: AI fields (ai_detected_category, ai_confidence, ai_report)

1. Push to GitHub- **NEW**: Department assignment (assigned_department, official_summary)

2. Import project in Vercel- **NEW**: User feedback (user_rating, user_feedback)

3. Add environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`**complaint_actions**

   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`- Timeline of actions for each complaint

4. Deploy!- Tracks emails, escalations, resolutions, status changes

- Provides transparency

### Manual

**users** (managed by Supabase Auth)

```bash- User authentication data

npm run build- **NEW**: Role field (user/admin) for access control

npm start

```See `frontend/database_schema.sql` for complete schema and setup SQL.



---## 🧪 Testing Checklist



## 🐛 Troubleshooting### Authentication & Access

- [x] User registration works

**AI features not showing?**- [x] Login/logout functionality

- Run the database migration SQL (see `database_schema.sql` Section 7)- [x] Admin dashboard access

- Sign up and login to access features- [x] Role-based route protection

- Check browser console for errors

### Complaint Submission

**Admin button not appearing?**- [x] Image upload to Supabase Storage

- You must be logged in- [x] **AI analysis triggers on image upload**

- Check navbar for your email- [x] **AI confidence display (85-99%)**

- [x] **AI confirmation workflow**

**Build errors?**- [x] GPS location detection

- Run `npm install` again- [x] Map marker placement

- Delete `.next` folder and rebuild- [x] Form validation

- Check environment variables are set- [x] Data saved to database



📖 **Full troubleshooting**: See [`frontend/FRONTEND_DOCUMENTATION.md`](./frontend/FRONTEND_DOCUMENTATION.md)### Dashboard & Tracking

- [x] Dashboard map renders

---- [x] Complaint details page loads

- [x] **AI report displays correctly**

## 📞 Support- [x] **User feedback submission (owner-only)**

- [x] Timeline displays correctly

**Documentation**: [`frontend/FRONTEND_DOCUMENTATION.md`](./frontend/FRONTEND_DOCUMENTATION.md)- [x] **Status updates reflect in timeline**



**Issues**: Open a GitHub issue with:### Admin Features

- Error messages- [x] **Admin statistics accurate**

- Steps to reproduce- [x] **Complaints table search works**

- Screenshots- [x] **Status update saves to database**

- Browser console logs- [x] **Admin complaint detail view**

- [x] **Navigation between admin pages**

---

### UI/UX

## 👥 Team- [x] Dark mode toggles properly

- [x] Mobile responsive

**ByteOrbit** - Hackarena 2025- [x] **AI sparkles icons display**

- [x] **Badge components render**

---- [x] **Table components functional**



## 📄 License## 🏆 Hackathon Details



[Specify License]- **Event**: Hackarena 2025

- **Team**: ByteOrbit

---- **Category**: Civic Tech / Government Innovation

- **Timeline**: [Add dates]

## 🙏 Acknowledgments

## 📞 Support

- Next.js - React framework

- Supabase - Backend infrastructureFor issues or questions:

- Shadcn/ui - UI components1. Check [FRONTEND_DOCUMENTATION.md](./frontend/FRONTEND_DOCUMENTATION.md)

- Leaflet - Map visualization2. Review the [Troubleshooting section](./frontend/FRONTEND_DOCUMENTATION.md#troubleshooting)

- Tailwind CSS - Styling system3. Search existing GitHub issues

4. Create a new issue with details

---

## 📝 License

**Built with ❤️ for better communities** 🏙️

[Specify license - MIT recommended for open source]

## 🙏 Acknowledgments

- **Next.js** for the excellent framework
- **Supabase** for backend infrastructure
- **Shadcn** for beautiful UI components
- **Leaflet** for mapping capabilities
- **Tailwind CSS** for styling system

## 📈 Project Stats

- **Lines of Code**: ~5,500+ (previously ~3,500)
- **Components**: 22+ (previously 15+)
- **Pages**: 9 (previously 7)
- **Database Tables**: 2 (with extended schema)
- **API Routes**: Supabase handles all backend
- **New Features**: AI Analysis, Admin Dashboard, User Feedback

## 🎯 Vision & Impact

CivicAgent aims to:
1. **Empower Citizens**: Give them a voice and visibility
2. **Improve Accountability**: Make government response transparent
3. **Speed Up Resolution**: Automated follow-ups reduce delays
4. **Build Trust**: Transparency builds confidence in governance
5. **Data-Driven Decisions**: Analytics help identify systemic issues

## 🚀 Next Steps

1. **Backend Development**: Build AI agent for automated follow-ups
2. **Email Integration**: Connect with government email systems
3. **Mobile App**: Develop iOS/Android versions
4. **Analytics Dashboard**: Create insights for administrators
5. **Scale**: Deploy to multiple municipalities

---

**Built with ❤️ for better communities**

For the complete experience and detailed setup instructions, see [frontend/FRONTEND_DOCUMENTATION.md](./frontend/FRONTEND_DOCUMENTATION.md).

Happy coding! 🎉
