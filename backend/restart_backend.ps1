# PowerShell script to restart the backend
Write-Host "🛑 Stopping any running Node.js processes on port 5000..." -ForegroundColor Yellow

# Find and kill processes on port 5000
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force
            Write-Host "✅ Stopped process $pid" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not stop process $pid" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "ℹ️  No processes found on port 5000" -ForegroundColor Cyan
}

Write-Host "`n🚀 Starting backend server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the server
Set-Location $PSScriptRoot
node server.js

