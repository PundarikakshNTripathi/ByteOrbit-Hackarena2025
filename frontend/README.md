# CivicAgent Frontend

A modern, responsive web application for reporting and tracking civic issues. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

> 📖 **For complete documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)**  
> 🧭 **For navigation guide, see [NAVIGATION_GUIDE.md](./NAVIGATION_GUIDE.md)**  
> 🚀 **For quick setup, see [QUICKSTART.md](./QUICKSTART.md)**

## 🚀 Features

- **User Authentication**: Secure signup and login with Supabase Auth
- **Issue Reporting**: Multi-step form to submit civic complaints with:
  - Image upload with preview
  - GPS location tracking with interactive map adjustment
  - Categorized issue types
  - Detailed descriptions
- **Status Tracking**: Real-time timeline showing the progress of each complaint
- **Public Dashboard**: Interactive map displaying all reported issues with color-coded status indicators
- **Dark Mode**: System-aware theme with manual toggle
- **Responsive Design**: Mobile-first design optimized for all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: Zustand
- **Backend**: Supabase (Auth, Database, Storage)
- **Maps**: Leaflet.js
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js LTS (v18 or higher)
- Git Bash (for Windows users)
- A Supabase account and project

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ByteOrbit-Hackarena2025/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholders with your actual Supabase credentials from your Supabase project settings.

### 4. Set up Supabase Database

Create the following tables in your Supabase database:

#### Complaints Table

```sql
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

-- Create policies
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

#### Complaint Actions Table

```sql
create table complaint_actions (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references complaints(id) on delete cascade not null,
  action_type text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table complaint_actions enable row level security;

-- Create policies
create policy "Anyone can view complaint actions"
  on complaint_actions for select
  using (true);
```

#### Storage Bucket for Images

```sql
-- Create storage bucket
insert into storage.buckets (id, name, public)
values ('complaint-images', 'complaint-images', true);

-- Create storage policy
create policy "Anyone can upload complaint images"
  on storage.objects for insert
  with check (bucket_id = 'complaint-images');

create policy "Anyone can view complaint images"
  on storage.objects for select
  using (bucket_id = 'complaint-images');
```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📦 Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 🎨 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── (main)/              # Main application routes
│   │   ├── complaint/       # Complaint details
│   │   │   └── [id]/        # Dynamic route for complaint ID
│   │   ├── dashboard/       # Public dashboard with map
│   │   ├── submit/          # Submit new complaint
│   │   ├── layout.tsx       # Main layout with navbar/footer
│   │   └── page.tsx         # Home/landing page
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   ├── ui/                  # Shadcn UI components
│   ├── complaint-form.tsx   # Multi-step complaint form
│   ├── map-picker.tsx       # Location picker map
│   ├── map-view.tsx         # Dashboard map view
│   ├── status-timeline.tsx  # Complaint action timeline
│   ├── theme-provider.tsx   # Theme context provider
│   └── theme-toggle.tsx     # Dark mode toggle
├── lib/                     # Utility functions
│   ├── supabase.ts          # Supabase client & types
│   ├── store.ts             # Zustand state management
│   └── utils.ts             # Helper functions
└── public/                  # Static assets
```

## 🔐 Authentication Flow

1. Users can sign up with email and password
2. Login redirects to the home page
3. Protected routes (like `/submit`) require authentication
4. User session is managed globally with Zustand
5. Sign out clears the session and redirects to home

## 📍 Complaint Submission Flow

1. **Step 1**: Upload an image of the issue
2. **Step 2**: Set the location (auto-detect or manually adjust on map)
3. **Step 3**: Select category and provide description
4. Submit to Supabase database
5. Redirect to dashboard to view the submission

## 🗺️ Dashboard Features

- View all complaints on an interactive map
- Color-coded markers by status:
  - Blue: Submitted
  - Yellow: In Progress
  - Red: Escalated
  - Green: Resolved
- Click markers to view complaint summaries
- Statistics cards showing issue counts by status

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Theming

- Light and dark mode support
- System preference detection
- Persistent theme selection
- Smooth transitions between themes

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own complaints
- Public read access for transparency
- Secure file uploads to Supabase Storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Hackarena 2025 hackathon.

## 🆘 Troubleshooting

### Map not loading
- Ensure you're using Git Bash for commands
- Check that Leaflet CSS is imported correctly
- Verify dynamic imports are used for map components

### Supabase connection issues
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure RLS policies are configured

### Build errors
- Clear `.next` folder and rebuild
- Delete `node_modules` and reinstall dependencies
- Check TypeScript errors with `npm run lint`

## 📞 Support

For issues or questions, please open an issue in the GitHub repository.
