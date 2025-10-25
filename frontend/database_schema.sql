-- CivicAgent Database Schema for Supabase
-- Run these queries in the Supabase SQL Editor

-- ============================================
-- 1. COMPLAINTS TABLE
-- ============================================
create table if not exists complaints (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  description text not null,
  landmark text,
  latitude decimal not null,
  longitude decimal not null,
  image_url text,
  status text default 'submitted' check (status in ('submitted', 'in_progress', 'escalated', 'resolved', 'rejected')),
  
  -- AI-powered fields
  ai_detected_category text,
  ai_confidence integer,
  ai_report text,
  assigned_department text,
  official_summary text,
  
  -- User feedback fields
  user_rating integer check (user_rating >= 1 and user_rating <= 5),
  user_feedback text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table complaints enable row level security;

-- RLS Policies for complaints
create policy "Anyone can view complaints"
  on complaints for select
  using (true);

create policy "Users can insert their own complaints"
  on complaints for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own complaints"
  on complaints for update
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists idx_complaints_user_id on complaints(user_id);
create index if not exists idx_complaints_status on complaints(status);
create index if not exists idx_complaints_created_at on complaints(created_at desc);

-- ============================================
-- 2. COMPLAINT ACTIONS TABLE (Timeline)
-- ============================================
create table if not exists complaint_actions (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references complaints(id) on delete cascade not null,
  action_type text not null check (action_type in ('submitted', 'emailed', 'email_sent', 'escalated', 'resolved', 'rejected', 'sla_missed', 'follow_up', 'status_change', 'in_progress')),
  description text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table complaint_actions enable row level security;

-- RLS Policies for complaint_actions
create policy "Anyone can view complaint actions"
  on complaint_actions for select
  using (true);

create policy "System can insert complaint actions"
  on complaint_actions for insert
  with check (true);

-- Create index for faster queries
create index if not exists idx_complaint_actions_complaint_id on complaint_actions(complaint_id);
create index if not exists idx_complaint_actions_created_at on complaint_actions(created_at desc);

-- ============================================
-- 3. STORAGE BUCKET SETUP
-- ============================================
-- Create the storage bucket for complaint images (do this in Supabase Dashboard or via SQL)
insert into storage.buckets (id, name, public)
values ('complaint-images', 'complaint-images', true)
on conflict (id) do nothing;

-- Storage policies for complaint images
create policy "Anyone can upload complaint images"
  on storage.objects for insert
  with check (bucket_id = 'complaint-images');

create policy "Anyone can view complaint images"
  on storage.objects for select
  using (bucket_id = 'complaint-images');

create policy "Users can update their own images"
  on storage.objects for update
  using (bucket_id = 'complaint-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own images"
  on storage.objects for delete
  using (bucket_id = 'complaint-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 4. HELPFUL FUNCTIONS
-- ============================================

-- Function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to call the function
create trigger update_complaints_updated_at
  before update on complaints
  for each row
  execute function update_updated_at_column();

-- ============================================
-- 5. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a sample complaint (replace user_id with a real user ID from auth.users)
-- insert into complaints (user_id, category, description, landmark, latitude, longitude, status)
-- values (
--   'your-user-id-here',
--   'Pothole',
--   'Large pothole on main road causing traffic issues',
--   'Near City Hall',
--   28.6139,
--   77.2090,
--   'submitted'
-- );

-- Insert sample actions for the complaint
-- insert into complaint_actions (complaint_id, action_type, description)
-- values (
--   'complaint-id-here',
--   'submitted',
--   'Complaint submitted successfully'
-- );

-- ============================================
-- 6. USEFUL QUERIES
-- ============================================

-- Get all complaints with action count
-- select 
--   c.*,
--   count(ca.id) as action_count
-- from complaints c
-- left join complaint_actions ca on c.id = ca.complaint_id
-- group by c.id
-- order by c.created_at desc;

-- Get complaint statistics by status
-- select 
--   status,
--   count(*) as count
-- from complaints
-- group by status;

-- Get recent complaints with latest action
-- select 
--   c.*,
--   ca.action_type as latest_action,
--   ca.created_at as latest_action_date
-- from complaints c
-- left join lateral (
--   select * from complaint_actions
--   where complaint_id = c.id
--   order by created_at desc
--   limit 1
-- ) ca on true
-- order by c.created_at desc
-- limit 10;

-- ============================================
-- 7. MIGRATION SCRIPT FOR EXISTING DATABASES
-- ============================================
-- If you already have a database set up, run these queries to add new fields:

-- Add AI-powered fields to complaints table
alter table complaints add column if not exists ai_detected_category text;
alter table complaints add column if not exists ai_confidence integer;
alter table complaints add column if not exists ai_report text;
alter table complaints add column if not exists assigned_department text;
alter table complaints add column if not exists official_summary text;

-- Add user feedback fields to complaints table
alter table complaints add column if not exists user_rating integer check (user_rating >= 1 and user_rating <= 5);
alter table complaints add column if not exists user_feedback text;

-- Update status check constraint to include 'rejected'
alter table complaints drop constraint if exists complaints_status_check;
alter table complaints add constraint complaints_status_check 
  check (status in ('submitted', 'in_progress', 'escalated', 'resolved', 'rejected'));

-- Update action_type check constraint to include new action types
alter table complaint_actions drop constraint if exists complaint_actions_action_type_check;
alter table complaint_actions add constraint complaint_actions_action_type_check 
  check (action_type in ('submitted', 'emailed', 'email_sent', 'escalated', 'resolved', 'rejected', 'sla_missed', 'follow_up', 'status_change', 'in_progress'));

-- ============================================
-- 8. ADMIN USER SETUP (Optional)
-- ============================================
-- Note: User roles are managed in the User interface TypeScript type
-- For production, you would want to create a separate admin_users table or use Supabase Auth metadata

-- Example: Update a user's metadata to make them an admin (run in Supabase Dashboard or via API)
-- This is pseudocode - actual implementation depends on your auth setup:
-- update auth.users 
-- set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- where email = 'admin@example.com';

