@echo off
echo Starting Pitch Trivia AI Generator...
echo.
echo Starting server...
start "Server" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting client...
start "Client" cmd /k "cd client && npm start"
echo.
echo Both server and client are starting...
echo Server: http://localhost:5000
echo Client: http://localhost:3000
pause

