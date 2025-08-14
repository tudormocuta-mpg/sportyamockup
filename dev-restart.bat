@echo off
echo 🔄 Restarting development server with cache clearing...

REM Kill existing Node processes
taskkill /F /IM node.exe 2>nul

REM Wait for processes to terminate
timeout /t 2 /nobreak >nul

REM Clear caches
echo 🗑️ Clearing caches...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
npm cache clean --force >nul 2>&1

REM Find available port and start server
echo 🚀 Starting fresh development server...
set /a "port=3010"
:findport
netstat -an | find ":%port%" >nul
if %errorlevel%==0 (
    set /a "port+=1"
    if %port% LSS 3030 goto findport
)

echo Starting on port %port%...
set PORT=%port%
npm run dev