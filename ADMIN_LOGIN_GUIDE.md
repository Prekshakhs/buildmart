# Admin Login Guide - BuildMart

## 🔐 Admin Authentication Overview

Admin users in BuildMart can **login using the same regular login flow** as buyers and sellers. The difference is:
- Admin user has `role: "admin"` in their User record
- Admin-specific endpoints are protected by `authorize("admin")` middleware
- Admin can access the Admin Dashboard at `/admin`

---

## 👤 Creating an Admin User

### Option 1: Automatic Setup (Recommended) ✅

Run the admin seeder script to automatically create a default admin:

```bash
cd backend
node scripts/seed-admin.js
```

**Output:**
```
Connected to MongoDB
✅ Admin user created successfully!

📝 Admin Login Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Email:    admin@buildmart.com
  Password: Admin@123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features:**
- ✅ Checks if admin already exists (won't create duplicates)
- ✅ Sets `emailVerified: true` (no email verification needed)
- ✅ Sets `isActive: true`
- ✅ Pre-configured credentials

### Option 2: Manual Creation via MongoDB

Connect to MongoDB and insert directly:

```javascript
// MongoDB Shell
use buildmart
db.users.insertOne({
  name: "Admin User",
  email: "admin@buildmart.com",
  password: "$2b$12$...", // bcrypt hash of "Admin@123"
  role: "admin",
  phone: "+91-9876543210",
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Option 3: Using API + Database Update

1. Register as normal user:
```bash
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@buildmart.com",
  "password": "Admin@123",
  "role": "admin"
}
```

2. Verify email (click link in console/email)

3. Update user role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@buildmart.com" },
  { $set: { role: "admin" } }
)
```

---

## 🚪 Admin Login Steps

### Step 1: Open Login Page
Navigate to: `http://localhost:5173/login`

### Step 2: Enter Admin Credentials
- **Email:** `admin@buildmart.com`
- **Password:** `Admin@123`

### Step 3: Click Login
```
[admin@buildmart.com] [••••••••]
[  LOGIN  ]
```

### Step 4: Access Admin Dashboard
After successful login, you'll be redirected to the app. Admin can access:
- **Admin Dashboard:** `/admin` (if implemented)
- **Admin Controls:** Available in navigation menu
- **User Management:** View and manage users
- **Order Management:** View and manage all orders
- **Product Management:** Remove products
- **Seller Approval:** Approve/reject seller applications

---

## 🔐 Security Notes for Admin Accounts

### ⚠️ IMPORTANT: Change Default Password

**After first login, immediately change the default password:**

1. Go to Profile → Password tab
2. Enter current password: `Admin@123`
3. Enter new secure password (8+ chars, mixed case, numbers)
4. Click "Change Password"

### Best Practices

✅ **Do:**
- Use strong, unique password (20+ characters recommended)
- Keep admin credentials confidential
- Rotate password every 90 days
- Monitor admin login history
- Use admin account only for administrative tasks
- Logout from admin account after use

❌ **Don't:**
- Share admin credentials
- Use simple passwords (e.g., "admin", "123456")
- Leave admin session active unattended
- Use admin account for regular shopping
- Store credentials in files or emails

---

## 📊 Admin Features

### Admin Dashboard
Access: `http://localhost:5173/admin`

**Available Actions:**
- View all users (buyers, sellers, admins)
- Toggle user active/deactivated status
- View all orders across platform
- Approve/reject seller applications
- View all products
- Remove inappropriate products
- View security metrics

### User Management
```
GET  /api/admin/users - List all users
PUT  /api/admin/users/:id/toggle - Deactivate/activate user
```

### Seller Management
```
PUT  /api/admin/sellers/:id/approve - Approve seller
```

### Order Management
```
GET  /api/admin/orders - List all orders
```

### Product Management
```
GET  /api/admin/products - List all products
DELETE /api/admin/products/:id - Remove product
```

---

## 🔑 Admin Credentials Management

### Changing Admin Password

1. **Login as admin:**
   - Email: `admin@buildmart.com`
   - Password: (current password)

2. **Go to Profile → Password**
   - Current Password: Enter existing password
   - New Password: Enter new secure password (8+ chars)
   - Confirm Password: Re-enter new password
   - Click "Change Password"

3. **Effects:**
   - ✅ Password updated in database
   - ✅ All admin sessions revoked (force re-login)
   - ✅ Security alert sent
   - ✅ Logout and login with new password

### Resetting Admin Password (Lost/Forgotten)

If admin forgets the password:

**Option 1: Using MongoDB (Quick)**
```bash
# Connect to MongoDB
mongo buildmart

# Update admin password hash
# First, generate bcrypt hash of new password

# In Node.js terminal:
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('NewAdminPassword@123', 12);
console.log(hash);

# Then in MongoDB:
db.users.updateOne(
  { email: "admin@buildmart.com" },
  { $set: { password: "<paste_hash_here>" } }
)
```

**Option 2: Using Forgot Password Flow**
```
1. Go to login page
2. Click "Forgot Password"
3. Enter: admin@buildmart.com
4. Check email console output
5. Click reset link
6. Enter new password
7. Login with new credentials
```

---

## 📋 Admin Verification Checklist

After creating admin account:

✅ Admin account created (`admin@buildmart.com`)
✅ Can login with credentials
✅ Admin dashboard accessible
✅ Can view users list
✅ Can view orders
✅ Can manage products
✅ Password changed from default
✅ Login history shows admin activity
✅ Security alerts working

---

## 🚨 Troubleshooting Admin Login

### Problem: "Email not verified" error
**Solution:**
- Ensure `emailVerified: true` is set in database
- Run seed script again: `node scripts/seed-admin.js`
- Or manually update: `db.users.updateOne({email: "admin@buildmart.com"}, {$set: {emailVerified: true}})`

### Problem: "Invalid credentials" error
**Solution:**
- Double-check email: `admin@buildmart.com`
- Double-check password (case-sensitive)
- Ensure user role is "admin": `db.users.findOne({email: "admin@buildmart.com"})`
- If wrong role, update: `db.users.updateOne({email: "admin@buildmart.com"}, {$set: {role: "admin"}})`

### Problem: "Too many login attempts" / Account locked
**Solution:**
- Wait 30 minutes for lockout to expire
- Or reset failed attempts in database:
```javascript
db.users.updateOne(
  { email: "admin@buildmart.com" },
  { $set: { loginAttempts: 0, lockUntil: null } }
)
```

### Problem: Cannot access admin endpoints
**Solution:**
- Verify logged-in user is admin: `db.users.findOne({email: "admin@buildmart.com"}).role`
- Check if account is active: `isActive: true`
- Verify token is valid (refresh if expired)
- Check server logs for authorization errors

---

## 🔄 Admin Session Management

### View Admin Sessions
1. Go to Profile page
2. Click "Sessions" tab
3. View all active admin sessions
4. Can revoke any session or all others

### Logout Admin
1. Click user dropdown (top-right)
2. Select "Logout"
3. Session immediately revoked
4. Cookies cleared
5. Redirected to login page

### Force Logout (Admin Compromise)
If admin account compromised:
1. Go to Profile → Sessions
2. Click "Revoke All Other Sessions"
3. All sessions terminated except current
4. Change password immediately
5. Review login history for unauthorized access

---

## 📝 Admin Audit Trail

### View Admin Activity
Check `/api/auth/login-history` endpoint for:
- All login attempts (successful/failed)
- IP addresses
- Browser/device info
- Timestamps
- Status

### Monitor Admin Actions
Check `/api/security-alerts` for:
- Admin login notifications
- Password change alerts
- Failed login attempts
- Account lockout events
- Session revocation logs

---

## 🛡️ Multi-Admin Setup

### Creating Multiple Admins

For organizations needing multiple admins:

**Method 1: Duplicate seed script**
```bash
# Copy seed-admin.js
cp backend/scripts/seed-admin.js backend/scripts/seed-admin-john.js

# Edit email and name:
# name: "John Admin"
# email: "john.admin@buildmart.com"

# Run it:
node backend/scripts/seed-admin-john.js
```

**Method 2: Manual database insertion**
```javascript
db.users.insertMany([
  {
    name: "Admin 1",
    email: "admin1@buildmart.com",
    password: "$2b$12$...",
    role: "admin",
    emailVerified: true,
    isActive: true
  },
  {
    name: "Admin 2",
    email: "admin2@buildmart.com",
    password: "$2b$12$...",
    role: "admin",
    emailVerified: true,
    isActive: true
  }
])
```

### Each Admin Can:
- Login independently
- Have separate login history
- Manage own sessions
- Change own password
- Access same admin features

---

## ✅ Summary

**Admin Login Process:**
1. ✅ Run: `node backend/scripts/seed-admin.js` (one-time setup)
2. ✅ Go to: `http://localhost:5173/login`
3. ✅ Enter: `admin@buildmart.com` / `Admin@123`
4. ✅ Access: Admin dashboard and features
5. ✅ Change password on first login

**Important:**
- Admin uses same login as regular users
- Admin distinguished by `role: "admin"` in database
- Email verification pre-set for admin accounts
- Admin endpoints protected by `authorize("admin")` middleware
- Always change default admin password after setup

---

*Last Updated: 2026-05-12*
*Version: 1.0 - Complete Admin Auth Guide*
