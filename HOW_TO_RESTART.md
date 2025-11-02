# 🔄 How to Restart the Backend - Step by Step

## Method 1: Using the Terminal (Easiest)

### Step 1: Find Your Backend Terminal
Look for a terminal/command prompt window where you see something like:
```
Backend running ✅
```
or
```
Server running on port 5000
```

### Step 2: Stop the Server
- Click on that terminal window to make it active
- Press **Ctrl + C** on your keyboard (hold Ctrl, press C)
- You should see the server stop

### Step 3: Start It Again
In the SAME terminal, type:
```bash
npm start
```
Press Enter

You should see: `Backend running ✅`

**Done!** ✅

---

## Method 2: Close and Reopen (Simple)

### Step 1: Close the Terminal
- Find the terminal running the backend
- Close it (click the X button)

### Step 2: Open a New Terminal
- Open PowerShell or Command Prompt
- Navigate to your project:
```bash
cd C:\Users\hmshe\Desktop\dsa_prep_agent\backend
```

### Step 3: Start the Server
```bash
npm start
```

**Done!** ✅

---

## Method 3: Kill Process and Restart (If Others Don't Work)

### Step 1: Open PowerShell
- Press Windows key
- Type "PowerShell"
- Open PowerShell

### Step 2: Go to Backend Folder
Copy and paste this (one line at a time):
```powershell
cd C:\Users\hmshe\Desktop\dsa_prep_agent\backend
```

### Step 3: Kill Old Processes
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
```

### Step 4: Start Fresh
```powershell
npm start
```

**Done!** ✅

---

## How to Know It Worked

After restarting, test it:

1. Open a web browser
2. Go to: http://localhost:5000/api/test
3. You should see:
```json
{
  "message": "Backend is running!",
  "model": "gemini-2.0-flash",
  "apiKeyConfigured": true
}
```

If you see this, it worked! ✅

---

## Visual Guide

```
┌─────────────────────────────────┐
│  Terminal Window                 │
│  $ npm start                     │
│  Backend running ✅              │  ← This is your backend
│                                 │
└─────────────────────────────────┘
```

**To restart:**
1. Click in the terminal
2. Press Ctrl+C (stops it)
3. Type: `npm start`
4. Press Enter (starts it)

---

## Troubleshooting

**Q: I don't see any terminal with "Backend running"**
- You might not have the backend running yet
- Just open a terminal and run `cd backend` then `npm start`

**Q: Ctrl+C doesn't work**
- Make sure you clicked inside the terminal window first
- Try clicking the terminal, then pressing Ctrl+C

**Q: I get "port already in use"**
- The old process is still running
- Use Method 3 to kill it

**Q: Still confused?**
- Just close ALL terminal windows
- Open a fresh one
- Run: `cd C:\Users\hmshe\Desktop\dsa_prep_agent\backend`
- Run: `npm start`

