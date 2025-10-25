# CivicAgent - Hackarena 2025 Project

## 🎯 Project Summary

**CivicAgent** is an AI-powered civic engagement platform that enables citizens to report and track municipal issues (potholes, garbage dumps, broken streetlights, etc.) with complete transparency. The system automatically follows up with local authorities and escalates issues when necessary, ensuring timely resolution.

## 🌟 Key Features

### For Citizens
- 📸 **Easy Reporting**: Multi-step form with image upload and GPS location
- 🗺️ **Interactive Dashboard**: View all reported issues on a map
- 📊 **Status Tracking**: Real-time timeline showing resolution progress
- 🌙 **Modern Interface**: Beautiful, responsive design with dark mode
- 🔐 **Secure Authentication**: Email-based signup and login

### For Government (Future Backend Integration)
- 🤖 **AI Agent**: Automated email follow-ups to authorities
- ⏰ **SLA Monitoring**: Track response times and escalate delays
- 📈 **Analytics**: Issue trends and resolution metrics
- 📧 **Email Integration**: Automatic communication with officials

## 📁 Repository Structure

```
ByteOrbit-Hackarena2025/
└── frontend/                    # Next.js Web Application
    ├── app/                     # App Router pages
    ├── components/              # React components
    ├── lib/                     # Utilities and helpers
    ├── public/                  # Static assets
    ├── database_schema.sql      # Supabase database setup
    ├── README.md                # Detailed documentation
    ├── QUICKSTART.md            # Quick setup guide
    ├── PROJECT_OVERVIEW.md      # Architecture details
    ├── CONTRIBUTING.md          # Contribution guidelines
    └── setup.sh                 # Automated setup script
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- Git Bash (Windows) or Terminal (Mac/Linux)
- Supabase account (free tier works)

### Installation (5 minutes)

1. **Clone the repository**
   ```bash
   git clone https://github.com/PundarikakshNTripathi/ByteOrbit-Hackarena2025.git
   cd ByteOrbit-Hackarena2025/frontend
   ```

2. **Run setup script**
   ```bash
   bash setup.sh
   ```
   Or manually:
   ```bash
   npm install
   ```

3. **Configure environment**
   - Create a Supabase project at https://supabase.com
   - Update `frontend/.env.local` with your credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Setup database**
   - Run the SQL in `frontend/database_schema.sql` in Supabase SQL Editor
   - Create storage bucket named `complaint-images`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Navigate to http://localhost:3000
   - Sign up and start reporting issues!

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: Zustand
- **Maps**: Leaflet.js
- **Icons**: Lucide React

### Backend (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (future)

### Infrastructure
- **Hosting**: Vercel/Netlify (recommended)
- **Version Control**: Git + GitHub

## 📊 Feature Breakdown

### ✅ Completed Features

#### 1. User Authentication
- [x] Email/password signup
- [x] Login and session management
- [x] Protected routes
- [x] Sign out functionality

#### 2. Complaint Submission
- [x] Multi-step form (3 steps)
- [x] Image upload with preview
- [x] GPS auto-detection
- [x] Interactive map for location adjustment
- [x] Category selection
- [x] Description and landmark fields

#### 3. Dashboard
- [x] Interactive map with all complaints
- [x] Color-coded status markers
- [x] Statistics cards
- [x] Responsive design

#### 4. Complaint Tracking
- [x] Individual complaint detail pages
- [x] Status timeline
- [x] Image display
- [x] Location map

#### 5. UI/UX
- [x] Responsive design (mobile-first)
- [x] Dark mode support
- [x] Modern, clean interface
- [x] Accessibility features

### 🔮 Future Enhancements

#### Backend AI Agent (Next Phase)
- [ ] Automated email sending to authorities
- [ ] SLA tracking and escalation
- [ ] Follow-up reminders
- [ ] Status updates

#### Frontend Improvements
- [ ] Real-time updates via WebSockets
- [ ] Advanced filtering and search
- [ ] Export reports (PDF/CSV)
- [ ] User profile management
- [ ] Notification system

#### Mobile App
- [ ] React Native version
- [ ] Push notifications
- [ ] Offline support

## 📖 Documentation

Comprehensive documentation is available in the `frontend/` directory:

1. **README.md** - Complete guide with installation, features, and API
2. **QUICKSTART.md** - Step-by-step setup for beginners
3. **PROJECT_OVERVIEW.md** - Architecture, design decisions, and data flow
4. **CONTRIBUTING.md** - Guidelines for contributors

## 🎨 Screenshots

### Landing Page
Modern hero section with clear call-to-action buttons

### Complaint Form
Intuitive 3-step process:
1. Upload evidence photo
2. Pin location on map
3. Describe the issue

### Dashboard
Interactive map showing all issues with color-coded markers

### Status Tracker
Timeline view of all actions taken on a complaint

## 🔐 Security & Privacy

- **Row Level Security (RLS)**: Database-level access control
- **Secure Authentication**: Handled by Supabase Auth
- **Public Transparency**: All complaints visible to promote accountability
- **User Privacy**: Email addresses not exposed publicly

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy!

## 🤝 Contributing

We welcome contributions! Please see `frontend/CONTRIBUTING.md` for:
- Code style guidelines
- Pull request process
- Development workflow
- Testing requirements

## 📄 Database Schema

### Tables

**complaints**
- Stores all reported issues
- Includes location, category, description, status
- Links to user and image

**complaint_actions**
- Timeline of actions for each complaint
- Tracks emails, escalations, resolutions
- Provides transparency

See `frontend/database_schema.sql` for complete schema and setup SQL.

## 🧪 Testing Checklist

- [x] User registration works
- [x] Login/logout functionality
- [x] Image upload to Supabase Storage
- [x] GPS location detection
- [x] Map marker placement
- [x] Form validation
- [x] Data saved to database
- [x] Dashboard map renders
- [x] Complaint details page loads
- [x] Timeline displays correctly
- [x] Dark mode toggles properly
- [x] Mobile responsive

## 🏆 Hackathon Details

- **Event**: Hackarena 2025
- **Team**: ByteOrbit
- **Category**: Civic Tech / Government Innovation
- **Timeline**: [Add dates]

## 📞 Support

For issues or questions:
1. Check the documentation in `frontend/`
2. Search existing GitHub issues
3. Create a new issue with details
4. Contact team members

## 📝 License

[Specify license - MIT recommended for open source]

## 🙏 Acknowledgments

- **Next.js** for the excellent framework
- **Supabase** for backend infrastructure
- **Shadcn** for beautiful UI components
- **Leaflet** for mapping capabilities
- **Tailwind CSS** for styling system

## 📈 Project Stats

- **Lines of Code**: ~3,500
- **Components**: 15+
- **Pages**: 7
- **Database Tables**: 2
- **API Routes**: Supabase handles all backend

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

For the complete experience, navigate to the `frontend/` directory and follow the QUICKSTART.md guide.

Happy coding! 🎉
