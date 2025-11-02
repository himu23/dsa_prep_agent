# 🔄 RESTART INSTRUCTIONS - IMPORTANT!

## The Problem
The backend server is still running with the OLD code. You need to **restart it** for the fixes to take effect.

## Steps to Fix

### 1. Find and Stop the Old Backend
- Look for the terminal/command prompt where you ran `npm start` or `node server.js`
- Press **Ctrl+C** to stop it
- Or find the process and kill it

### 2. Verify the Backend is Stopped
Run this command to check:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName
```

If you see node processes, you might need to kill them:
```powershell
Stop-Process -Name node -Force
```

### 3. Start the Backend Fresh
```bash
cd backend
npm start
```

You should see: `Backend running ✅`

### 4. Test the Backend
Open a new terminal and test:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/test" -UseBasicParsing
```

You should get a response with the model name "gemini-2.0-flash"

### 5. Test the API Call
```bash
cd backend
node test_api.js
```

You should see: ✅ SUCCESS! API is working!

## Quick Check: Is Server Running New Code?

The new code has:
- Model: `gemini-2.0-flash` (not `gemini-1.5-flash`)
- Better error logging
- Test endpoint at `/api/test`

If your server doesn't have the `/api/test` endpoint, it's running old code!

## Still Not Working?

1. **Check the backend terminal output** - Look for error messages
2. **Check the console logs** - The new code logs detailed errors
3. **Verify .env file** - Make sure `GEMINI_API_KEY` is set correctly
4. **Test API key directly**:
   ```bash
   cd backend
   node test_api.js
   ```

## Why This Happens
Node.js keeps the old code in memory. When you update files, the running server doesn't automatically reload unless you're using a tool like `nodemon` or restart the server manually.

