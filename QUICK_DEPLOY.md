# ⚡ Quick Deploy to Render - Cheat Sheet

## 🔑 Step 1: Get Base64 Credentials (30 seconds)

**PowerShell:**
```powershell
$json = Get-Content google-credentials.json -Raw; [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))
```

**Copy the output!**

---

## 🚀 Step 2: Deploy Backend (2 minutes)

1. **Render Dashboard:** https://render.com/dashboard → New + → Web Service
2. **Connect GitHub:** Select `StatBubblesNfl` repo
3. **Settings:**
   - Build: `npm install`
   - Start: `npm start`
4. **Environment Variables:**
   ```
   MONGODB_URI = your_mongo_connection_string
   VLEAGUE_SPREADSHEET_ID = your_sheet_id
   GOOGLE_CREDENTIALS_BASE64 = [paste base64 here]
   PORT = 3000
   ```
5. **Click:** Create Web Service

**Your backend URL:** `https://your-app-name.onrender.com`

---

## 🎨 Step 3: Deploy Frontend (2 minutes)

1. **Render Dashboard:** New + → Static Site
2. **Same Repo:** `StatBubblesNfl`
3. **Settings:**
   - Root Directory: `Frontend`
   - Build: `npm install && npm run build`
   - Publish: `Frontend/dist`
4. **Environment Variables:**
   ```
   VITE_API_URL = https://your-backend-name.onrender.com
   ```
5. **Click:** Create Static Site

**Your frontend URL:** `https://your-frontend-name.onrender.com`

---

## ✅ Step 4: Update CORS (1 minute)

In `src/server.js`, add your frontend URL to CORS:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-name.onrender.com' // Add this!
  ]
}));
```

**Commit and push** - Render auto-deploys!

---

## 🧪 Test It Works

```bash
# Test backend
curl https://your-backend.onrender.com/api/stats/vleague/info

# Test V League
curl https://your-backend.onrender.com/api/stats/V%20League/PTS
```

**Done! 🎉**

---

## 🐛 If Something Breaks

1. **Check Render Logs** - Click "Logs" tab in dashboard
2. **Verify env vars** - Make sure base64 has no spaces
3. **MongoDB connection** - Whitelist Render IPs in MongoDB Atlas
4. **CORS errors** - Add frontend URL to backend CORS list

---

## 💡 Pro Tips

- **Free tier sleeps** after 15min (30s cold start)
- **Upgrade to $7/month** for always-on
- **Auto-deploy** is enabled by default on git push
- **Custom domain** available on all tiers

**Total time: ~5 minutes** ⏱️

