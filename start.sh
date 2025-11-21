#!/bin/bash

echo "Starting Pitch Trivia AI Generator..."
echo ""
echo "Starting server..."
cd server && npm start &
SERVER_PID=$!

sleep 3

echo ""
echo "Starting client..."
cd ../client && npm start &
CLIENT_PID=$!

echo ""
echo "Both server and client are starting..."
echo "Server: http://localhost:5000"
echo "Client: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait

