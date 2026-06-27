@echo off
REM ============================================================
REM  LoL Flash Tracker - one-time build script
REM  Double-click this file to build a standalone .exe.
REM  Requires Node.js installed: https://nodejs.org  (LTS is fine)
REM  After it finishes, your .exe is in the "dist" folder.
REM  You only need to do this ONCE - then just run the .exe.
REM ============================================================

cd /d "%~dp0"

echo.
echo [1/2] Installing dependencies (first run can take a few minutes)...
echo.
call npm install
if errorlevel 1 goto error

echo.
echo [2/2] Building the portable .exe...
echo.
call npm run dist:win
if errorlevel 1 goto error

echo.
echo ============================================================
echo  Done! Open the "dist" folder and run the .exe.
echo  (It's portable - you can move it anywhere, e.g. the desktop.)
echo ============================================================
echo.
pause
exit /b 0

:error
echo.
echo Something went wrong. Make sure Node.js is installed (https://nodejs.org),
echo then try double-clicking this file again.
echo.
pause
exit /b 1
