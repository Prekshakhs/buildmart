# 🚀 Complete Deployment Guide - Vercel + Render + MongoDB Atlas

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    End Users                             │
└──────────────────────────┬──────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │    Vercel   │ Frontend
                    │  (React)    │ https://buildmart.vercel.app
                    └──────┬──────┘
                           │ API calls
        ┌──────────────────▼──────────────────┐
        │         Internet                    │
        └──────────────────┬──────────────────┘
                           │
                    ┌──────▼──────┐
                    │    Render   │ Backend
                    │  (Node.js)  │ https://buildmart-api.onrender.com
                    └──────┬──────┘
                           │ Database queries
        ┌──────────────────▼──────────────────┐
        │    MongoDB Atlas Cloud Database     │
        │         (Data Storage)               │
        └─────────────────────────────────────┘
```

---

# ⚙️ STEP 1: MongoDB Atlas Setup (15 mins)

## 1.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Sign Up"** (or Sign In if you have account)
3. Create free account (M0 tier is free forever!)
4. Choose your cloud provider (AWS/Google Cloud/Azure) - doesn't matter
5. Select region closest to you

## 1.2 Create Cluster

1. After login, click **"Create"** → **"Build a Cluster"**
2. Choose **M0 Shared Cluster** (free tier)
3. Click **"Create Cluster"**
4. Wait 3-5 minutes for cluster to initialize

## 1.3 Get Connection String

1. Click **"Connect"** button on your cluster
2. Select **"Connect your application"**
3. Choose **"Node.js"** driver
4. Copy the connection string:

```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/buildmart?retryWrites=true&w=majority
```

**Save this securely! You'll need it for Render.**

## 1.4 Create Database User

In MongoDB Atlas Dashboard:

1. Click **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. Username: `buildmart_user`
4. Password: Generate a strong password (copy it!)
5. Database User Privileges: **"Read and Write to any database"**
6. Click **"Add User"**

**Your connection string format will be:**

```
mongodb+srv://buildmart_user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/buildmart?retryWrites=true&w=majority
```

---

# ⚙️ STEP 2: Deploy Backend on Render (15 mins)

## 2.1 Create Render Account

1. Go to https://render.com
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** (easier!)
4. Authorize Render to access your GitHub

## 2.2 Create New Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Search for `buildmart`
4. Select **"Prekshakhs/buildmart"** repo
5. Click **"Connect"**

## 2.3 Configure Service

Fill in these details:

| Field             | Value                       |
| ----------------- | --------------------------- |
| **Name**          | `buildmart-api`             |
| **Region**        | Choose closest to you       |
| **Branch**        | `main`                      |
| **Runtime**       | `Node`                      |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start`   |
| **Plan**          | `Free` (starts at $0/month) |

## 2.4 Add Environment Variables

Scroll down to **"Environment"** section.

Click **"Add Environment Variable"** and add each:

```
NODE_ENV = production
PORT = 10000

MONGODB_URI = mongodb+srv://buildmart_user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/buildmart?retryWrites=true&w=majority

JWT_SECRET = your_super_secret_jwt_key_123!@#

ACCESS_TOKEN_EXPIRY = 15m
REFRESH_TOKEN_EXPIRY = 7d
RESET_PASSWORD_EXPIRY = 1h
EMAIL_VERIFY_EXPIRY = 24h

MAX_LOGIN_ATTEMPTS = 5
LOCK_TIME = 30m
RATE_LIMIT_WINDOW = 15m

CLIENT_URL = https://buildmart.vercel.app

CLOUDINARY_NAME = your_cloudinary_name
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret

GMAIL_USER = your_email@gmail.com
GMAIL_PASSWORD = your_app_password

RAZORPAY_KEY_ID = your_razorpay_key
RAZORPAY_KEY_SECRET = your_razorpay_secret
```

## 2.5 Deploy Backend

Click **"Create Web Service"**

Watch deployment logs... should complete in 2-3 minutes.

**Once deployed, you'll get a URL like:**

```
https://buildmart-api.onrender.com
```

**Test it:**

```bash
curl https://buildmart-api.onrender.com/api/health
# Should return: {"success":true,"message":"Marketplace API is running 🚀"}
```

**⚠️ Save this URL!** You'll need it for Vercel.

---

# ⚙️ STEP 3: Deploy Frontend on Vercel (10 mins)

## 3.1 Go to Vercel

1. Open https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **"buildmart"** repo

## 3.2 Configure Project

**Root Directory:** Select `frontend` (NOT root)

**Framework:** React (auto-detected)

**Build Settings:**

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_BASE_URL = https://buildmart-api.onrender.com
VITE_RAZORPAY_KEY = your_razorpay_public_key
```

## 3.4 Deploy Frontend

Click **"Deploy"** button

Wait 2-3 minutes... Done! ✅

**Your live URL:**

```
https://buildmart.vercel.app
```

---

# ✅ STEP 4: Verification Checklist

### Test Frontend

```
1. Visit https://buildmart.vercel.app
2. ✅ Page loads (no blank screen)
3. ✅ Products display
4. ✅ Navigation works
5. ✅ Responsive on mobile
```

### Test Backend Connection

```
1. Open browser console (F12)
2. Go to Network tab
3. Try to login
4. Check API request goes to: buildmart-api.onrender.com/api/auth/login
5. ✅ Response shows user data (success)
```

### Test Full Flow

```
1. ✅ Register new account
2. ✅ Check verification email
3. ✅ Login
4. ✅ Browse products
5. ✅ Add to cart
6. ✅ Place order (test payment)
7. ✅ Check order in profile
```

---

# 🔄 STEP 5: Backend Auto-Redeploy (Important!)

Render auto-redeploys when you push to GitHub:

```bash
# After making changes locally
git add .
git commit -m "Your feature"
git push origin main

# Render automatically:
# 1. Detects the push
# 2. Pulls latest code
# 3. Rebuilds backend
# 4. Deploys new version
# (takes 2-3 minutes)
```

**Frontend also auto-deploys with Vercel!** 🎉

---

# 🐛 Troubleshooting

## "Connection refused" error

- Check MongoDB Atlas connection string is correct
- Verify network access in MongoDB Atlas (IP whitelist)

## "Cannot connect to backend"

- Check Render backend is running (green status)
- Verify `VITE_API_BASE_URL` in Vercel matches Render URL
- Check `CLIENT_URL` in Render env matches Vercel URL

## "Build failed on Render"

- Check backend folder has `package.json`
- Run locally: `cd backend && npm install && npm start`
- Check git repo has all files

## "Image upload not working"

- Verify Cloudinary credentials are correct
- Check Cloudinary account is active

## "Email not sending"

- Verify Gmail app password (not regular password!)
- Check "Less secure apps" setting in Gmail

---

# 📊 Costs

| Service           | Cost                                 |
| ----------------- | ------------------------------------ |
| **MongoDB Atlas** | Free (M0 tier, up to 512MB)          |
| **Render**        | Free (sleep after 15 min inactivity) |
| **Vercel**        | Free (1GB per month)                 |
| **Total**         | **$0/month!** 🎉                     |

> Upgrade to paid plans later when you need more power

---

# 🎯 Next Steps After Deployment

1. **Add custom domain** (Optional)
   - Buy domain on Namecheap/GoDaddy
   - Point to Vercel (auto-handles SSL certificate!)

2. **Set up backups**
   - MongoDB Atlas: Automatic daily backups
   - Render: Runs continuously, no action needed

3. **Monitor performance**
   - Vercel Analytics: Check speed
   - Render Logs: Check errors
   - MongoDB Atlas: Check database usage

4. **Enable Production Database Backup**
   - MongoDB Atlas → Backup & Restore → Enable daily backups

---

# 📞 Support Links

- **Vercel Help:** https://vercel.com/docs
- **Render Help:** https://render.com/docs
- **MongoDB Help:** https://docs.mongodb.com/

---

**You're all set! 🎉 Your marketplace is now LIVE on the internet!**
