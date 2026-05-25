# 🚀 Deployment Guide - BuildMart

## Frontend Deployment (Vercel)

### Prerequisites

- GitHub account
- Vercel account (free)
- Node.js and npm installed locally

### Step 1: Prepare Code for Deployment

```bash
# Make sure all changes are committed
git status
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Search and select your GitHub repo `buildmart`
5. Click **"Import"**

### Step 3: Configure Environment Variables in Vercel

In the Vercel dashboard, go to **Settings** → **Environment Variables**

Add these variables:

```
VITE_API_BASE_URL = https://your-backend-url.com/api
VITE_RAZORPAY_KEY = your_razorpay_public_key
```

> Replace `https://your-backend-url.com/api` with your actual backend API URL

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait 2-5 minutes for build to complete
3. Once done, you'll get a live URL like: `https://buildmart.vercel.app`

---

## Backend Deployment

### Option A: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Select `buildmart` repo
5. Railway auto-detects Node.js backend
6. Add environment variables:
   - `MONGODB_URI` - your MongoDB connection string
   - `JWT_SECRET` - your JWT secret
   - `GMAIL_USER` - your email
   - `GMAIL_PASSWORD` - your app password
   - All other `.env` variables
7. Click **"Deploy"**
8. Railway gives you a live API URL

### Option B: Heroku (Popular but Paid)

[Similar process, requires credit card]

### Step 5: Update Frontend with Backend URL

After backend is deployed, update Vercel env variable:

```
VITE_API_BASE_URL = https://your-railway-backend.up.railway.app/api
```

Vercel will auto-redeploy with new URL.

---

## Post-Deployment

### Verify Deployment

```bash
# Test frontend
curl https://buildmart.vercel.app

# Test backend
curl https://your-backend-url/api/health
```

### Monitor Performance

- Vercel: Dashboard → **Analytics**
- Railway: Dashboard → **Logs** and **Metrics**

### Update Features

**After updating code locally:**

```bash
git add .
git commit -m "Update: your-feature"
git push origin main
```

Vercel auto-deploys on push! 🎉

---

## Important Notes

✅ Keep `.env` file with secrets **NOT in Git** (use `.gitignore`)  
✅ Update `VITE_API_BASE_URL` after backend deployment  
✅ Test all features after deployment  
✅ Monitor logs for errors  
✅ Keep MongoDB backup

---

## Troubleshooting

**Build fails?**

- Check `npm run build` locally first
- Verify all environment variables are set

**API calls fail?**

- Ensure `VITE_API_BASE_URL` is correct
- Check CORS configuration in backend

**Image upload not working?**

- Verify Cloudinary credentials in backend `.env`

---

Need help? Check logs:

- **Vercel:** Deployments → Click deployment → View logs
- **Railway:** Logs tab in dashboard
