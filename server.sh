#!/binlsof -t -i:3000/bash
PID=$()
if [ -n "$PID" ]; then
  echo "Killing process $PID"
  kill $PID
fi

npm install

# Chạy ứng dụng
nohup node server.js 2>&1 &
