# 🔐 GitHub OAuth Setup & Debugging Guide

## ✅ What Was Fixed

### 1. **New OAuth Callback Route Added**
   - **Route**: `GET /auth/github/callback` (in `index.js`)
   - **Purpose**: Receives redirect from GitHub after user authorization
   - **Handles**: 
     - Error handling from GitHub
     - Code validation
     - Token exchange via `exchangeCodeForToken()`
     - Proper redirect to frontend with success/error status

### 2. **Updated Token Exchange Route**
   - **Route**: `GET /api/github/callback` (in `routes/github.js`)
   - **Enhanced**: Better error handling, logging, and frontend redirect

### 3. **Session Middleware**
   - Added `cookie-parser` and `express-session` to `index.js`
   - Sessions store GitHub connection status
   - 24-hour session timeout

### 4. **Environment Variables**
   - Updated `.env.example` with all required variables

---

## 🔧 Setup Checklist

### Step 1: GitHub OAuth App Configuration
- [ ] Go to: https://github.com/settings/developers
- [ ] Click "New OAuth App"
- [ ] Fill in:
  - **Application name**: CodeMentor AI (or any name)
  - **Homepage URL**: `http://localhost:5500`
  - **Authorization callback URL**: **`http://localhost:5000/auth/github/callback`** ⭐ (This must match!)
- [ ] Copy `Client ID` and `Client Secret`

### Step 2: Environment Variables
```bash
# .env file in backend/ directory
GITHUB_CLIENT_ID=your_client_id_from_github
GITHUB_CLIENT_SECRET=your_client_secret_from_github
SESSION_SECRET=my-secret-session-key-12345
GROQ_API_KEY=your_groq_key
```

### Step 3: Verify Dependencies
```bash
cd backend
npm install express-session cookie-parser
```

### Step 4: Restart Backend
```bash
npm start
```

❌ **Stop** and restart if you changed `.env`! Environment variables only load on startup.

---

## 🧪 Testing GitHub OAuth Flow

### Test 1: Check if Route Exists
```bash
# Terminal command
curl http://localhost:5000/auth/github/callback
```
Expected: Should redirect (not "Cannot GET")

### Test 2: Check Backend Health
```bash
curl http://localhost:5000/health
```
Expected output:
```json
{
  "status": "ok",
  "groqKeySet": true,
  "githubConfig": true
}
```

### Test 3: Manual OAuth Flow
1. Open browser console (F12)
2. Run:
   ```javascript
   window.location.href = 'http://localhost:5000/api/github/oauth';
   ```
3. You should be redirected to GitHub login
4. After login, should redirect to `http://localhost:5500/review.html?github=connected`

### Test 4: Check Logs
Look for these messages in backend console:
```
✅ GitHub OAuth successful! Redirecting to review.html
🔄 Exchanging code for GitHub token...
```

---

## ❌ Troubleshooting

### Issue: "Cannot GET /auth/github/callback"
**Cause**: Backend not restarted after changes
**Fix**: Stop and restart `npm start`

### Issue: "Cannot GET /api/github/callback"  
**Cause**: GitHub app callback URL doesn't match
**Fix**: Update GitHub app settings to `http://localhost:5000/auth/github/callback`

### Issue: Infinite redirect loop
**Cause**: Token exchange failing
**Fix**: Check backend logs for `OAuth token exchange failed` error

### Issue: Session not persisting
**Cause**: SESSION_SECRET not in `.env`
**Fix**: Add `SESSION_SECRET=some-random-string` to `.env` and restart

### Issue: CORS error on frontend
**Cause**: Origin not in allowedOrigins
**Fix**: Your frontend URL must be in the CORS list in `index.js`

---

## 🔍 Debug Mode: Enable Verbose Logging

Add to `index.js` before app listen:
```javascript
// Debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, { session: req.session?.githubConnected });
  next();
});
```

---

## 📋 Expected Flow

```
1. User clicks "Connect GitHub" on frontend
   ↓
2. Frontend redirects to: /api/github/oauth
   ↓
3. Backend redirects to: GitHub login page
   ↓
4. User authorizes in GitHub
   ↓
5. GitHub redirects to: /auth/github/callback with `code` param
   ↓
6. Backend exchanges code for token
   ↓
7. Backend redirects to: http://localhost:5500/review.html?github=connected
```

---

## 📝 Files Modified

| File | Changes |
|------|---------|
| `index.js` | Added session middleware, OAuth callback route |
| `routes/github.js` | Updated callback route with proper error handling |
| `.env.example` | Added GitHub OAuth environment variables |

---

## 🚀 Next Steps

1. ✅ Update GitHub OAuth app callback URL
2. ✅ Add environment variables to `.env`
3. ✅ Restart backend
4. ✅ Test the flow
5. ✅ Check browser console and backend logs

---

## 💡 Pro Tips

- Use `http://127.0.0.1` instead of `localhost` if having issues
- GitHub callback URL must use `http://` for localhost (not `https://`)
- Each GitHub app can only have ONE callback URL (for authenticated flow)
- Session tokens are stored in-memory (lost on server restart)
- For production, use Redis for session storage

---

## 🆘 Still Having Issues?

Check:
1. Backend running? → `npm start`
2. Environment variables set? → `echo $GITHUB_CLIENT_ID`
3. GitHub callback URL correct? → GitHub settings
4. Frontend URL in CORS? → Check `index.js` corsOptions
5. Browser console errors? → F12 → Console tab
6. Backend console errors? → Check terminal where `npm start` runs

