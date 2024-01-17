#!/bin/bash
PID=$(lsof -t -i:3000)
if [ -n "$PID" ]; then
  echo "Killing process $PID"
  kill $PID
fi
