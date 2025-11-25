# 🚀 Deploying to Render with Google Sheets Integration

## 📋 Prerequisites

1. Render account (https://render.com)
2. Google Cloud service account credentials
3. Your repository pushed to GitHub (with credentials removed!)

---

## 🔑 Step 1: Prepare Google Credentials

### Convert JSON to Base64:

**Option A - PowerShell (Windows):**
```powershell
$json = Get-Content google-credentials.json -Raw
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))
```

**Option B - Node.js (Any OS):**
```bash
node -e "console.log(Buffer.from(require('fs').readFileSync('google-credentials.json')).toString('base64'))"
```

**Copy the entire output** - it will look like: `eyJwcm9qZWN0X2lkIjoiaW1wYWN0ZnVs...` (very long string)

---

## 🌐 Step 2: Deploy Backend to Render

### 1. Create New Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `StatBubblesNfl` repository

### 2. Configure Service

**Basic Settings:**
- **Name:** `statbubbles-backend` (or your choice)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave empty (or `.` if needed)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Start with **Free** tier for testing
- Upgrade to **Starter ($7/month)** for production

### 3. Add Environment Variables

Click **"Advanced"** and add these environment variables:

```
MONGODB_URI = your_mongodb_connection_string
PORT = 3000
NODE_ENV = production

# V League Google Sheets
VLEAGUE_SPREADSHEET_ID = your_spreadsheet_id_here
GOOGLE_CREDENTIALS_BASE64 = [paste the base64 string from Step 1]

# Other environment variables from your .env file
# Add any other secrets you have
```

**Important:** 
- `GOOGLE_CREDENTIALS_BASE64` should be the entire base64 string (no quotes needed in Render)
- Don't use `GOOGLE_SHEETS_KEY_FILE` on Render

### 4. Deploy

Click **"Create Web Service"**

Render will:
- Clone your repository
- Run `npm install`
- Start your server
- Give you a URL like: `https://statbubbles-backend.onrender.com`

---

## 🎨 Step 3: Deploy Frontend to Render

### 1. Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect same repository
3. Select `StatBubblesNfl` repository

### 2. Configure Static Site

**Basic Settings:**
- **Name:** `statbubbles-frontend`
- **Branch:** `main`
- **Root Directory:** `Frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `Frontend/dist`

### 3. Add Environment Variables

```
VITE_API_URL = https://statbubbles-backend.onrender.com
```

### 4. Update Frontend API Config

Make sure `Frontend/src/config/api.js` uses environment variable:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

---

## 🔧 Step 4: Update CORS Settings

Since frontend and backend are on different domains, update your backend CORS:

**In `src/server.js`:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://statbubbles-frontend.onrender.com', // Add your Render frontend URL
  ],
  credentials: true
}));
```

---

## ✅ Step 5: Test Deployment

### Test Backend:
```bash
curl https://statbubbles-backend.onrender.com/api/stats/vleague/info
```

Should return:
```json
{
  "success": true,
  "message": "V League reads data directly from Google Sheets!"
}
```

### Test V League Data:
```bash
curl https://statbubbles-backend.onrender.com/api/stats/V%20League/PTS
```

Should return player data!

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid Credentials" Error

**Solution:** 
- Verify base64 encoding is correct
- Make sure no extra spaces or newlines
- Re-generate the base64 string

### Issue 2: Backend Sleeps on Free Tier

**Problem:** Render free tier sleeps after 15 minutes of inactivity

**Solutions:**
- Upgrade to Starter tier ($7/month)
- Use a service like UptimeRobot to ping every 14 minutes
- Accept the 30-second cold start on first request

### Issue 3: CORS Errors

**Solution:**
- Add your frontend URL to CORS whitelist
- Make sure frontend is using correct backend URL
- Check browser console for exact error

### Issue 4: Environment Variable Not Loading

**Solution:**
- Make sure no quotes around values in Render dashboard
- Restart service after adding environment variables
- Check logs for "undefined" errors

---

## 📊 Step 6: Monitor Your Deployment

### View Logs:
1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Look for:
   - `✅ MongoDB connected`
   - `🚀 Server running on port 3000`
   - `📊 Starting V League auto-refresh`

### Check V League Auto-Refresh:
Should see every minute:
```
🔄 Auto-refreshing V League (1 subscriptions active)
📊 Broadcasted V League PTS update to all clients
```

---

## 💰 Cost Breakdown

**Free Tier:**
- Backend: Free (sleeps after 15min inactivity)
- Frontend: Free
- Total: $0/month

**Production Tier:**
- Backend: $7/month (Starter)
- Frontend: Free
- Total: $7/month

---

## 🔐 Security Best Practices

✅ **DO:**
- Use environment variables for ALL secrets
- Keep `google-credentials.json` in `.gitignore`
- Rotate credentials regularly
- Use HTTPS only in production
- Limit Google service account permissions

❌ **DON'T:**
- Commit credentials to git (ever!)
- Share base64 credentials publicly
- Use same credentials for dev/prod
- Expose internal endpoints

---

## 🚀 Next Steps

1. Set up custom domain (optional)
2. Configure MongoDB Atlas IP whitelist for Render
3. Set up monitoring (Render has built-in metrics)
4. Configure auto-deploy on git push
5. Set up staging environment

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Environment Variables Best Practices](https://render.com/docs/environment-variables)

---

## 🆘 Support

If you encounter issues:
1. Check Render logs first
2. Verify environment variables
3. Test Google Sheets connection locally
4. Check MongoDB connection string
5. Contact Render support (very responsive!)

**Deployment complete! Your app is now live! 🎉**

