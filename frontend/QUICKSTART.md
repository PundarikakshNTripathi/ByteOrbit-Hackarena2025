# CivicAgent Frontend - Quick Start Guide

This guide will help you get the CivicAgent frontend up and running quickly.

## Prerequisites Checklist

- [ ] Node.js LTS installed (v18 or higher)
- [ ] Git Bash installed (for Windows users)
- [ ] Supabase account created
- [ ] Text editor/IDE (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies

Open Git Bash in the `frontend` directory and run:

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase client
- Leaflet (for maps)
- Shadcn/ui components
- And more...

### 2. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: CivicAgent (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Wait for the project to be provisioned (~2 minutes)

### 3. Get Supabase Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Navigate to "API" in the sidebar
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 4. Configure Environment Variables

1. In the `frontend` directory, you'll find a `.env.local` file
2. Open it and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Save the file.

### 5. Set Up Database Tables

1. In Supabase, go to the "SQL Editor" tab
2. Click "New Query"
3. Copy and paste the following SQL to create the complaints table:

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

alter table complaints enable row level security;

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

4. Click "Run" to execute the query

5. Create a new query and paste the following for the complaint_actions table:

```sql
create table complaint_actions (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references complaints(id) on delete cascade not null,
  action_type text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table complaint_actions enable row level security;

create policy "Anyone can view complaint actions"
  on complaint_actions for select
  using (true);
```

6. Click "Run"

### 6. Set Up Storage Bucket

1. In Supabase, go to "Storage" in the sidebar
2. Click "Create a new bucket"
3. Name it: `complaint-images`
4. Make it **Public** (toggle the switch)
5. Click "Create bucket"

6. Go to "Policies" tab in Storage
7. Click "New Policy" for the `complaint-images` bucket
8. Choose "Custom" and paste:

```sql
-- Policy for uploading
create policy "Anyone can upload complaint images"
  on storage.objects for insert
  with check (bucket_id = 'complaint-images');

-- Policy for viewing
create policy "Anyone can view complaint images"
  on storage.objects for select
  using (bucket_id = 'complaint-images');
```

### 7. Run the Development Server

In Git Bash, run:

```bash
npm run dev
```

You should see:

```
> civic-agent-frontend@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

### 8. Open the Application

1. Open your browser
2. Go to [http://localhost:3000](http://localhost:3000)
3. You should see the CivicAgent landing page!

## Testing the Application

### Create an Account

1. Click "Sign Up" in the navbar
2. Enter your email and password
3. Submit the form
4. You'll be automatically logged in

### Submit a Complaint

1. Click "Submit Issue" in the navbar (or the button on the home page)
2. **Step 1**: Upload an image of the issue
3. **Step 2**: 
   - Click "Use My Current Location" to auto-detect
   - Or click on the map to set the location manually
4. **Step 3**: 
   - Select a category (e.g., "Pothole")
   - Add a landmark (e.g., "Near Central Park")
   - Write a description
5. Click "Submit Complaint"
6. You'll be redirected to the dashboard

### View the Dashboard

1. Click "Dashboard" in the navbar
2. You'll see:
   - Statistics cards showing issue counts
   - An interactive map with your submitted complaint
   - Color-coded markers based on status

### View Complaint Details

1. Click on a marker on the map
2. In the popup, click "View Details"
3. You'll see:
   - Full complaint information
   - The uploaded image
   - Location on map
   - Timeline of actions

## Common Issues & Solutions

### Issue: "Cannot connect to Supabase"
**Solution**: 
- Check your `.env.local` file has the correct credentials
- Ensure there are no extra spaces in the environment variables
- Restart the development server after changing `.env.local`

### Issue: "Geolocation not working"
**Solution**: 
- Use HTTPS in production (localhost is fine for development)
- Grant location permission when browser prompts
- If blocked, manually set location on the map

### Issue: Map not displaying
**Solution**: 
- This is normal on first load due to SSR
- The map loads dynamically on the client side
- Check browser console for any errors

### Issue: Image upload fails
**Solution**: 
- Ensure the storage bucket exists and is public
- Check that storage policies are correctly set
- Verify the bucket name is `complaint-images`

## Next Steps

1. **Customize the theme**: Edit `app/globals.css` to change colors
2. **Add more issue categories**: Update the `ISSUE_CATEGORIES` array in `components/complaint-form.tsx`
3. **Deploy to production**: Use Vercel, Netlify, or your preferred hosting platform
4. **Set up the backend agent**: Create automated email/escalation workflows

## Need Help?

- Check the main README.md for detailed documentation
- Review the Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Check Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)

## Development Tips

- Use Git Bash for all terminal commands (not PowerShell or CMD)
- Run `npm run lint` to check for code issues
- Use the React DevTools browser extension for debugging
- Check the browser console for errors during development

Happy coding! 🚀
