@echo off

echo ===================================
echo Starting Landslide Risk System...
echo ===================================

cd /d "%~dp0\ml\backend"

start cmd /k "python -m uvicorn main:app --reload"

timeout /t 8 >nul

start "" "%~dp0\ml\frontend\index.html"

echo System Started Successfully!
pauseU