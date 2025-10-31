@echo off
title Deploy Presensi Kelas 7
color 0A

echo.
echo  ========================================
echo         DEPLOY PRESENSI KELAS 7
echo  ========================================
echo.

cd "D:\Presensi Kelas 7"

echo  [INFO] Current directory: %CD%
echo.

REM Check for changes
git status --short > nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Not a git repository!
    goto :error
)

echo  [1/4] Checking for changes...
git status --short
echo.

set /p commit_msg="  Enter commit message (default: update terbaru): "
if "%commit_msg%"=="" set commit_msg=update terbaru

echo.
echo  [2/4] Staging changes...
git add .

echo  [3/4] Committing: %commit_msg%
git commit -m "%commit_msg%"

if errorlevel 1 (
    echo.
    echo  [WARNING] No changes to commit
    echo.
    set /p force_push="  Push anyway? (y/n): "
    if /i not "%force_push%"=="y" goto :end
)

echo  [4/4] Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo  ========================================
    echo         PUSH FAILED!
    echo  ========================================
    echo.
    echo  Check error message above
    goto :error
)

echo.
echo  ========================================
echo         DEPLOYMENT SUCCESS!
echo  ========================================
echo.
echo  GitHub: https://github.com/squad7fmuscil/presensi-kelas7
echo  Website: https://presensi-kelas7.vercel.app/
echo.
echo  Vercel will auto-deploy in 1-2 minutes.
echo  Check: https://vercel.com/dashboard
echo.
goto :end

:error
echo.
echo  [ERROR] Deployment failed!
echo.

:end
pause