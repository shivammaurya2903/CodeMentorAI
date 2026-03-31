# CodeMentorAI - Setup & Troubleshooting Guide

## Current Status
✅ Backend server is running on `http://localhost:5000`
✅ Frontend HTML and JavaScript have been fixed
⚠️ Groq API key may need verification

## How to Test

### 1. Backend Server
```bash
cd backend
npm start
```
Should show: `✅ Server running on port 5000`

### 2. API Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -Method Get
```
Should return: `{"status":"ok","groqKeySet":true}`

## Troubleshooting - "Server is not running" Error

### Issue 1: Backend Not Running
**Solution:** Start the backend in a terminal
```bash
cd e:\CodeMentorAI\backend
npm start
```
Keep this terminal open while using the app.

### Issue 2: API Key Not Working
The review endpoint is failing. This means the Groq API key needs attention.

**Steps to Fix:**

1. **Get a Free Groq API Key:**
   - Go to https://console.groq.com/keys
   - Sign up or login
   - Create a new API key
   - Copy it

2. **Update .env File:**
   - Open `e:\CodeMentorAI\backend\.env`
   - Replace the key:
   ```
   GROQ_API_KEY=gsk_YOUR_NEW_KEY_HERE
   ```
   - Save the file

3. **Restart Backend:**
   - Stop the server (Ctrl+C in terminal)
   - Run `npm start` again

### Issue 3: Connection Refused (Port 5000)
If you get "Connection refused" error:

**Check if something else is using port 5000:**
```powershell
netstat -ano | findstr :5000
```

**To free the port:**
```powershell
# Find process ID from above, then:
taskkill /PID <process_id> /F
```

Then restart: `npm start`

## Testing the Full Flow

1. **Start Backend:** `npm start` in `backend/` folder
2. **Open Frontend:** Open `frontend/review.html` in browser
3. **Paste Test Code:**
```javascript
function addNumbers(a, b) {
  let result = a + b;
  console.log(result);
  return result;
}
```
4. **Click "Get AI Review"**
5. **You should see AI feedback within 10 seconds**

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Server connection failed" | Backend not running | Run `npm start` |
| "Invalid API key" | Groq API key expired/invalid | Get new key from console.groq.com |
| "Service failed" | API quota exceeded | Wait or upgrade Groq account |
| "Network error" | Port 5000 blocked | Check firewall/port usage |

## Ports & URLs

- **Backend API:** `http://localhost:5000`
- **Frontend Dev:** `http://localhost:5500` (Live Server)
- **Frontend File:** `file:///.../frontend/review.html`

## Need Help?

If errors persist after these steps:
1. Check browser console (F12) for frontend errors
2. Check terminal output for backend errors
3. Verify .env file has correct API key format
4. Make sure backend is started and running
