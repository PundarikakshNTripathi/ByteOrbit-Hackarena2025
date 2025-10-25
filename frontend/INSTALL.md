# INSTALLATION INSTRUCTIONS

## Prerequisites Check

Before proceeding, ensure you have:
- ✅ Node.js 18+ LTS installed
- ✅ Git installed
- ✅ A code editor (VS Code recommended)

## Installation Steps

### Step 1: Open Git Bash Terminal

**Important**: You MUST use Git Bash (not PowerShell or CMD) for all commands.

1. Open Git Bash from the Start menu
2. Navigate to the frontend directory:
   ```bash
   cd /c/PROFESSIONAL/Hackathons/Hackarena2025/ByteOrbit-Hackarena2025/frontend
   ```

### Step 2: Verify Node.js Installation

```bash
node --version
npm --version
```

You should see version numbers. If not, install Node.js from https://nodejs.org/

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages (~5 minutes):
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase client
- Leaflet maps
- UI components
- And all other dependencies

### Step 4: Configure Environment Variables

1. The `.env.local` file already exists in the frontend directory
2. Open it and replace the placeholder values with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

To get these credentials:
- Go to https://supabase.com
- Create a new project (or use existing)
- Go to Settings > API
- Copy the Project URL and anon/public key

### Step 5: Set Up Database

1. In Supabase dashboard, go to SQL Editor
2. Run the SQL from `database_schema.sql` file
3. Create storage bucket named `complaint-images` in Storage section

### Step 6: Start Development Server

```bash
npm run dev
```

The application will start at http://localhost:3000

### Step 7: Verify Installation

Open http://localhost:3000 in your browser. You should see:
- ✅ CivicAgent landing page
- ✅ No console errors
- ✅ Navbar with theme toggle
- ✅ All pages loading correctly

## Troubleshooting

### "npm is not recognized"

**Problem**: PowerShell doesn't have npm in PATH

**Solution**: Use Git Bash instead of PowerShell:
1. Close PowerShell
2. Open Git Bash from Start menu
3. Run commands in Git Bash

### Build Errors After Installation

If you see TypeScript errors after installing:

```bash
# Clear cache and rebuild
rm -rf node_modules .next
npm install
npm run dev
```

### Module Not Found Errors

If you see "Cannot find module..." errors:

```bash
# Reinstall specific package
npm install <package-name>

# Or reinstall all
npm install
```

### Supabase Connection Errors

1. Check `.env.local` has correct credentials
2. Verify Supabase project is active
3. Check project URL format: `https://xxxxx.supabase.co`
4. Restart dev server after changing .env.local

### Map Not Loading

1. Check browser console for errors
2. Verify Leaflet CSS is loading
3. Clear browser cache
4. Try in incognito mode

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Next Steps After Installation

1. ✅ Sign up for an account on your local app
2. ✅ Test complaint submission
3. ✅ View dashboard with map
4. ✅ Test all features
5. ✅ Read QUICKSTART.md for detailed usage

## Getting Help

If you encounter issues:
1. Check this file first
2. Read QUICKSTART.md
3. Check README.md
4. Review error messages carefully
5. Search for error online
6. Open an issue on GitHub

## System Requirements

- **OS**: Windows 10+, macOS, or Linux
- **Node.js**: 18.x or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 500MB for dependencies

## Important Notes

⚠️ **Always use Git Bash on Windows** - PowerShell won't work properly
⚠️ **Install dependencies before running** - The app won't work without npm install
⚠️ **Configure .env.local** - Required for Supabase connection
⚠️ **Set up database** - Run the SQL schema in Supabase

---

**Ready to start?** Open Git Bash and run: `npm install`
