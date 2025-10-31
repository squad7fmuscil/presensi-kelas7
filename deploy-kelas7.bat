@echo off
echo ================================
echo   DEPLOY PRESENSI KELAS 7
echo ================================
echo.

cd "D:\Presensi Kelas 7"

echo [1/3] Adding files to git...
git add .

echo.
echo [2/3] Committing changes...
set /p commit_msg="Enter commit message (default: update terbaru): "
if "%commit_msg%"=="" set commit_msg=update terbaru
git commit -m "%commit_msg%"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ================================
echo   PUSH BERHASIL!
echo ================================
echo.
echo Vercel akan otomatis deploy dari GitHub.
echo Cek status deploy di: https://vercel.com/dashboard
echo.
pause
