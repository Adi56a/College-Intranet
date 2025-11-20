@echo off
timeout /t 5 /nobreak > nul
cd /d D:\intranet\backend
nodemon index.js
