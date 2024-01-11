#!/bin/bash
PID=$(lsof -t -i:3000)
if [ -n "$PID" ]; then
  echo "Killing process $PID"
  kill $PID
fi

npm install

# Chạy ứng dụng
nohup node server.js 2>&1 &
