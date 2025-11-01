# How to Set Main Branch as Default on GitHub

## ✅ Current Status
- ✅ `main` branch created locally
- ✅ `main` branch pushed to GitHub
- ⏳ Need to set `main` as default branch on GitHub

## 🔧 Steps to Set Default Branch

### Option 1: Via GitHub Web Interface (Recommended)

1. **Go to your repository on GitHub**:
   ```
   https://github.com/PundarikakshNTripathi/ByteOrbit-Hackarena2025
   ```

2. **Navigate to Settings**:
   - Click the **"Settings"** tab (near top right)

3. **Go to Branches Settings**:
   - In the left sidebar, click **"Branches"**
   - OR go directly to: `https://github.com/PundarikakshNTripathi/ByteOrbit-Hackarena2025/settings/branches`

4. **Change Default Branch**:
   - Under **"Default branch"** section
   - Click the **switch/pencil icon** next to your current default branch
   - A dropdown will appear - select **"main"**
   - Click **"Update"**
   
5. **Confirm the Change**:
   - A warning popup will appear
   - Read it (it's about updating branch protection rules if any)
   - Click **"I understand, update the default branch"**

6. **Verify**:
   - You should see "Default branch: main" in the Branches settings
   - Go back to repository home - it should now show "main" as the default

### Option 2: Via GitHub CLI (If you have gh CLI installed)

```bash
gh repo edit --default-branch main
```

## 🎯 What This Does

- **New clones** will checkout `main` by default
- **Pull Requests** will default to merging into `main`
- **Vercel/Render** will automatically use `main` for deployments
- **Repository homepage** will show `main` branch code

## 🧹 Optional: Clean Up Old Branch

Once you verify everything works from `main`:

```bash
# Delete the old branch locally (optional)
git branch -d Initial-Prototyping-P

# Delete the old branch from GitHub (optional)
git push origin --delete Initial-Prototyping-P
```

**Warning**: Only do this after you're 100% sure main has all your latest code!

## ✅ Verification Checklist

After setting default branch:

- [ ] GitHub repository homepage shows "main" branch
- [ ] Repository settings show "Default branch: main"
- [ ] Can clone repo and it checks out main by default
- [ ] Ready to deploy to Vercel/Render using main branch

---

**You're all set! The main branch is now ready for production deployment! 🚀**
