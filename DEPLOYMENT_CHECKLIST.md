# 📋 DEPLOYMENT QUICK CHECKLIST

## ✅ Before You Start

- [ ] Have GitHub account logged in
- [ ] Have MongoDB Atlas account
- [ ] Have Render account
- [ ] Have Vercel account
- [ ] All code pushed to GitHub (main branch)

---

## 📦 STEP 1: MongoDB Atlas (15 mins)

- [ ] Create MongoDB Atlas cluster
- [ ] Create database user (buildmart_user)
- [ ] Whitelist IP address (0.0.0.0/0 for free tier)
- [ ] Copy connection string with credentials
- [ ] Save connection string securely

**Connection String Format:**

```
mongodb+srv://buildmart_user:PASSWORD@cluster.abc123.mongodb.net/buildmart?retryWrites=true&w=majority
```

---

## 🔌 STEP 2: Deploy Backend on Render (15 mins)

- [ ] Create Render account (connect GitHub)
- [ ] Create new Web Service
- [ ] Connect GitHub repo `buildmart`
- [ ] Set Root Directory: `backend`
- [ ] Build Command: `cd backend && npm install`
- [ ] Start Command: `cd backend && npm start`
- [ ] Add all environment variables (see guide)
- [ ] Deploy and wait for success
- [ ] Copy Render backend URL (e.g., https://buildmart-api.onrender.com)
- [ ] Test: `curl https://buildmart-api.onrender.com/api/health`

**Save Backend URL!**

```
https://buildmart-api.onrender.com
```

---

## 🎨 STEP 3: Deploy Frontend on Vercel (10 mins)

- [ ] Create Vercel account (connect GitHub)
- [ ] Create new project from `buildmart` repo
- [ ] Set Root Directory: `frontend`
- [ ] Add environment variables:
  - `VITE_API_BASE_URL` = your Render backend URL
  - `VITE_RAZORPAY_KEY` = your Razorpay key
- [ ] Deploy and wait for success
- [ ] Copy Vercel frontend URL (e.g., https://buildmart.vercel.app)

**Save Frontend URL!**

```
https://buildmart.vercel.app
```

---

## ✅ STEP 4: Verification

- [ ] Visit frontend URL in browser
- [ ] Page loads completely (no errors)
- [ ] Check browser console (F12) - no red errors
- [ ] Test login/register flow
- [ ] Add product to cart
- [ ] Check API calls in Network tab go to backend URL
- [ ] Test on mobile (responsive design)
- [ ] Check all pages load

---

## 🔄 STEP 5: Auto-Redeploy Setup

- [ ] Understand: Push to GitHub → Auto-redeploys on Render + Vercel
- [ ] Test: Make small change, push, verify auto-deploy works

---

## 🎉 Deployment Complete!

- [ ] Frontend: https://buildmart.vercel.app ✅
- [ ] Backend: https://buildmart-api.onrender.com ✅
- [ ] Database: MongoDB Atlas ✅
- [ ] All tests passing ✅

---

## 📞 If Something Goes Wrong

**Frontend blank page?**

- Check browser console for errors (F12)
- Verify VITE_API_BASE_URL is correct in Vercel

**API errors?**

- Check Render backend is running (green status)
- Check environment variables in Render
- View logs: Render dashboard → Logs tab

**Database connection error?**

- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Verify buildmart_user credentials

---

**Questions? Check DEPLOYMENT_FULL_GUIDE.md for detailed steps!**
