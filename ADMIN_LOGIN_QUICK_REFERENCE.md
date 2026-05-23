# 🔐 Admin Login - Quick Reference

## ⚡ Quick Start (30 seconds)

```bash
# 1. Create admin account (one-time)
cd backend
node scripts/seed-admin.js

# 2. Open browser
http://localhost:5173/login

# 3. Enter credentials
Email:    admin@buildmart.com
Password: Admin@123

# 4. Click Login ✅
```

---

## 📊 Admin Credentials

| Field | Value |
|-------|-------|
| **Email** | admin@buildmart.com |
| **Password** | Admin@123 |
| **Role** | admin |
| **Email Verified** | Yes (auto-verified) |
| **Account Status** | Active |

---

## 🎯 After Login, Admin Can:

- ✅ View User Dashboard
- ✅ Manage Users (view, activate, deactivate)
- ✅ Approve/Reject Sellers
- ✅ View All Orders
- ✅ Remove Products
- ✅ View Security Analytics
- ✅ Access Admin Dashboard (/admin)

---

## 🚨 Security Checklist

**IMMEDIATELY after first login:**
1. ✅ Go to Profile → Password
2. ✅ Change default password to something strong
3. ✅ Use: 8+ chars, uppercase, lowercase, numbers, special chars
4. ✅ Example: `SecureAdm!nPass123`

**Ongoing:**
- ✅ Never share credentials
- ✅ Logout after each session
- ✅ Monitor login history (Profile → Login History)
- ✅ Review active sessions (Profile → Sessions)
- ✅ Change password every 90 days

---

## ❓ Troubleshooting

**Can't login?**
- Check email: `admin@buildmart.com` (exact)
- Check password: `Admin@123` (case-sensitive)
- Verify DB: `db.users.findOne({email: "admin@buildmart.com"})`
- Check `emailVerified: true` is set

**Forgot password?**
- Click "Forgot Password" on login page
- Enter: admin@buildmart.com
- Check console output for reset link
- Create new password

**Account locked (too many attempts)?**
- Wait 30 minutes for auto-unlock
- Or reset in MongoDB:
  ```javascript
  db.users.updateOne(
    {email: "admin@buildmart.com"},
    {$set: {loginAttempts: 0, lockUntil: null}}
  )
  ```

---

## 📋 Admin Login Flow

```
┌─────────────────────────────────┐
│ 1. Go to /login                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 2. Enter Email & Password       │
│    admin@buildmart.com          │
│    Admin@123                    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 3. Backend checks:              │
│    • Email exists?              │
│    • Password matches?          │
│    • Email verified?            │
│    • Account active?            │
│    • Not locked?                │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 4. Generate Tokens:             │
│    • Access (15 min)            │
│    • Refresh (7 days)           │
│    • httpOnly cookies           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 5. Create Session Record        │
│    • Device info                │
│    • IP address                 │
│    • Browser/OS                 │
│    • Last activity              │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 6. Send Security Alert          │
│    Email: New login detected    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ 7. Redirect to Dashboard        │
│    ✅ Admin logged in!          │
└─────────────────────────────────┘
```

---

## 📚 Full Documentation

For complete admin guide: See **ADMIN_LOGIN_GUIDE.md**

Topics covered:
- Creating multiple admins
- Password management
- Session management
- Admin features
- Troubleshooting
- Security best practices
- Audit trail
- Account recovery

---

*Version: 1.0*
*Updated: 2026-05-12*
