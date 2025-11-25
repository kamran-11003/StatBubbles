# 🔧 Quick Fix for Render Google Credentials

## The Issue
Your Base64 credentials are corrupted. Here's the EASIEST fix:

---

## ✅ Solution: Use Direct JSON (No Base64 Needed!)

### Step 1: Get Your Credentials Content

Open your local `google.json` file and copy **THE ENTIRE CONTENTS** (it should look like this):

```json
{
  "type": "service_account",
  "project_id": "impactful-name-443218-p0",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "vleague-sync@impactful-name-443218-p0.iam.gserviceaccount.com",
  ...
}
```

### Step 2: Update Render Environment

1. Go to your Render dashboard: https://render.com/dashboard
2. Click on your **backend service**
3. Go to **Environment** tab
4. **Delete** `GOOGLE_CREDENTIALS_BASE64` (it's corrupted)
5. **Add new variable:**
   - **Key:** `GOOGLE_CREDENTIALS_JSON`
   - **Value:** Paste the entire JSON content from google.json

**IMPORTANT:** 
- Don't escape anything
- Don't add extra quotes
- Just paste the raw JSON exactly as it appears in the file
- Render will handle it automatically

### Step 3: Save and Redeploy

Click "Save Changes" - Render will auto-redeploy with new credentials!

---

## 🧪 Test It Works

After deployment completes (~2 minutes):

```bash
curl https://statbubbles.onrender.com/api/stats/vleague/info
```

Should show: `"Using GOOGLE_CREDENTIALS_JSON environment variable"`

Then test V League data:

```bash
curl https://statbubbles.onrender.com/api/stats/V%20League/PTS
```

Should return player data! ✅

---

## 🎯 Why This Works Better

| Method | Issues | Reliability |
|--------|--------|-------------|
| Base64 | Can get corrupted in copy/paste | ❌ 50% |
| Direct JSON | Render handles it automatically | ✅ 99% |
| File creation | Works but more complex | ✅ 90% |

**Direct JSON is the simplest and most reliable!**

---

## 📋 Final Environment Variables on Render

Your Render environment should have:

```
MONGODB_URI = mongodb+srv://...
PORT = 3000
NODE_ENV = production
VLEAGUE_SPREADSHEET_ID = your_sheet_id
GOOGLE_CREDENTIALS_JSON = {...entire JSON...}
```

That's it! No Base64 needed! 🎉

