# Frontend Access Guide - FIX "Failed to fetch" Error

## The Problem
You're getting **"Failed to fetch"** because the frontend is being accessed incorrectly (likely via `file://` protocol which blocks API requests for security reasons).

## Solutions

### ✅ Option 1: Use Live Server (RECOMMENDED)
**Best for development - Auto-reloads on file changes**

1. **Install Live Server Extension in VS Code**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Install by Ritwick Dey

2. **Start Live Server**
   - Open `frontend/review.html`
   - Right-click → "Open with Live Server"
   - Browser opens to `http://localhost:5500`

3. **Test In Frontend**
   - Paste test code
   - Click "Get AI Review"
   - ✅ Should work!

---

### Option 2: Python HTTP Server
**Quick alternative if you don't have Live Server**

```powershell
cd e:\CodeMentorAI\frontend
python -m http.server 8000
```

Then open: `http://localhost:8000/review.html`

---

### Option 3: Node.js HTTP Server
```powershell
cd e:\CodeMentorAI\frontend
npx http-server -p 5500
```

Then open: `http://localhost:5500/review.html`

---

## ❌ Don't Do This
- ❌ Don't double-click the HTML file (opens as `file://` → CORS blocked)
- ❌ Don't try to access from a different machine without updating CORS
- ❌ Don't forget to restart the backend after endpoint changes

---

## Backend Status
✅ **Running on:** `http://localhost:5000`  
✅ **Health Check:** `http://localhost:5000/health`  
✅ **CORS:** Now allows origin-less requests (file://, mobile, curl)

## Quick Test
If the above doesn't work, this terminal test proves the API works:

```powershell
$body = @{ 
  code = "function add(a,b){return a+b;}"
  language = "javascript" 
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/review" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body -UseBasicParsing | Select-Object -ExpandProperty Content
```

This returns AI code review result.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to fetch" | Use Live Server, don't double-click HTML |
| Port 5000 already in use | Kill node: `taskkill /F /IM node.exe` then restart |
| API timeout (>30s) | Groq API might be slow, wait longer |
| CORS error (if from other domain) | Update backend CORS in `index.js` |
| "Invalid API key" | Check `.env` file has correct Groq key |

---

## Verified Working
- ✅ Backend: Running on port 5000
- ✅ API: Responding with code reviews
- ✅ CORS: Accepting requests
- ✅ Models: Using llama-3.1-8b-instant (working)

**Next Step:** Open frontend via Live Server and test!
