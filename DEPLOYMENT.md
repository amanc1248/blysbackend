# Backend Deployment Guide - Render

This guide will help you deploy the Task Manager backend API to Render.

## 🚀 Quick Deploy to Render

### Option 1: One-Click Deploy (Recommended)

1. **Push to GitHub** (if not already done):
```bash
cd /Users/amanchaudhary/Documents/personal/blys
git init
git add .
git commit -m "Initial commit: Task Manager app"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

2. **Deploy to Render**:
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create:
     - PostgreSQL database
     - Web service (API)
   - Click "Apply" to deploy

### Option 2: Manual Setup

#### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `taskmanager-db`
   - **Database**: `taskmanager`
   - **User**: (auto-generated)
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
3. Click "Create Database"
4. Wait for provisioning (1-2 minutes)
5. **Save the Internal Database URL** (you'll need this for the web service)

#### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `taskmanager-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT**
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Step 3: Set Environment Variables

In the web service, go to "Environment" tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render default |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Copy from database "Internal Database URL" |
| `JWT_SECRET` | (generate strong secret) | Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRE` | `7d` | Token expiry |
| `COOKIE_SECURE` | `true` | Enable for HTTPS |
| `FRONTEND_URL` | `https://your-netlify-app.netlify.app` | Your Netlify URL |

**To generate JWT_SECRET locally**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 4: Run Database Migrations

After deployment, you need to run migrations. Two options:

**Option A: Using Render Shell** (Recommended)
1. In Render dashboard, go to your web service
2. Click "Shell" tab
3. Run:
```bash
npm run migrate
```

**Option B: Using Local Connection**
1. Get the "External Database URL" from your database
2. Run locally:
```bash
DATABASE_URL="your-external-db-url" npm run migrate
```

#### Step 5: Deploy

1. Click "Create Web Service"
2. Wait for build and deployment (3-5 minutes)
3. Your API will be available at: `https://taskmanager-api.onrender.com`

---

## 🔧 Post-Deployment Configuration

### Update Frontend Environment Variable

Update your Netlify environment variable:

1. Go to Netlify Dashboard → Your Site → Site settings → Environment variables
2. Update `VITE_API_URL` to your Render URL:
   ```
   VITE_API_URL=https://taskmanager-api.onrender.com/api
   ```
3. **Trigger a new deployment** in Netlify (Deploy → Trigger deploy → Deploy site)

### Test Your API

```bash
# Health check
curl https://taskmanager-api.onrender.com/api/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Check `package.json` includes all dependencies
- Ensure `npm install` is in Build Command
- Check Root Directory is set to `backend`

**Error: "Node version"**
- Render uses Node 14 by default
- Add `.node-version` file or set in dashboard:
  ```bash
  echo "18" > .node-version
  git add .node-version
  git commit -m "Set Node version"
  git push
  ```

### Database Connection Issues

**Error: "Unable to connect to database"**
- Verify `DATABASE_URL` environment variable is set correctly
- Use **Internal Database URL** from Render (not External)
- Format: `postgresql://user:password@internal-host:5432/database`

**Error: "Relation does not exist"**
- Migrations haven't been run
- Connect via Shell and run: `npm run migrate`

### CORS Errors

**Error: "CORS policy blocked"**
- Verify `FRONTEND_URL` environment variable matches your Netlify URL
- Must include `https://` and no trailing slash
- Redeploy backend after updating

### Free Tier Limitations

⚠️ **Important**: Render free tier spins down after 15 minutes of inactivity

**Impact**:
- First request after idle: 30-60 second cold start
- Subsequent requests: Fast (< 100ms)

**Solutions**:
1. **Upgrade to paid plan** ($7/month - no spin down)
2. **Use cron job to keep alive** (ping every 10 minutes):
   - [UptimeRobot](https://uptimerobot.com/) (free)
   - [Cron-job.org](https://cron-job.org/) (free)
   
**Setup UptimeRobot**:
1. Create free account
2. Add new monitor
3. Monitor Type: HTTP(s)
4. URL: `https://taskmanager-api.onrender.com/api/health`
5. Monitoring Interval: 5 minutes

---

## 📝 Environment Variables Reference

Complete list for copy-paste:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@internal-host:5432/database
JWT_SECRET=your_generated_secret_here
JWT_EXPIRE=7d
COOKIE_SECURE=true
FRONTEND_URL=https://your-netlify-app.netlify.app
```

---

## 🔒 Security Checklist

Before going live:

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] COOKIE_SECURE set to `true`
- [ ] FRONTEND_URL matches your actual Netlify domain
- [ ] Database password is strong (auto-generated by Render)
- [ ] Environment variables are not committed to Git
- [ ] `.env` is in `.gitignore`

---

## 📊 Monitoring & Logs

### View Logs
1. Render Dashboard → Your Service → Logs tab
2. Real-time streaming logs
3. Filter by severity: Error, Warn, Info

### Metrics
- Render Dashboard → Your Service → Metrics tab
- View CPU, Memory, Request counts

---

## 🔄 Continuous Deployment

Auto-deploy on git push:

1. In Render Dashboard → Your Service → Settings
2. Auto-Deploy: **Yes**
3. Every push to `main` branch triggers deployment
4. View deployment progress in "Events" tab

---

## 💰 Cost Estimate

**Free Tier**:
- PostgreSQL: Free (shared CPU, 256MB RAM, 1GB storage)
- Web Service: Free (shared CPU, 512MB RAM)
- **Total**: $0/month

**Limitations**:
- Spins down after 15 min inactivity
- 750 hours/month
- Slower than paid tiers

**Starter Tier** ($7/month per service):
- Always on (no spin down)
- Faster CPU
- More RAM (1GB+)
- **Recommended for production**

---

## 🚀 Performance Optimization

### 1. Enable Compression
Already implemented in `server.js` via Express middleware.

### 2. Database Connection Pooling
Already configured in `config/db.js`:
```javascript
pool: {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

### 3. Add Indexes
Already included in migrations:
- `users.email` (for login)
- `tasks.user_id` (for task queries)
- `tasks.end_date` (for sorting)

---

## 📱 Testing Production API

### Using cURL

**Register**:
```bash
curl -X POST https://taskmanager-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login**:
```bash
curl -X POST https://taskmanager-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Tasks** (replace TOKEN):
```bash
curl https://taskmanager-api.onrender.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Run database migrations
3. ✅ Update Netlify environment variable
4. ✅ Test registration and login from Netlify app
5. ✅ Set up UptimeRobot for keep-alive (optional)
6. 📊 Monitor logs for errors
7. 🎥 Record demo video!

---

## 📞 Support

**Render Documentation**: https://render.com/docs
**PostgreSQL Issues**: Check connection strings and migrations
**CORS Issues**: Verify FRONTEND_URL matches Netlify domain

---

**Deployment completed successfully?** 🎉
Test your full-stack app at: `https://your-netlify-app.netlify.app`

