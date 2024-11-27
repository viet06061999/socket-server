#!/bin/bash

# Start the server in the background
nohup npm start > server.log 2>&1 &

echo "Transfer server started. Logs are being written to server.log"
