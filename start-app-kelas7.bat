@echo off
title Aplikasi Administrasi SDN1 Pasirpogor
color 1F

echo ================================================
echo               APLIKASI PRESENSI KELAS 7
echo ================================================
echo.
echo [*] Memulai aplikasi...
echo.

cd /d "D:\Presensi Kelas 7"

if not exist "package.json" (
    echo [ERROR] File package.json tidak ditemukan!
    echo Pastikan folder aplikasi sudah benar.
    echo.
    pause
    exit
)

echo [*] Menjalankan npm start...
echo.
echo ================================================
echo.

npm start

echo.
echo ================================================
echo [*] Aplikasi telah ditutup
echo ================================================
echo.