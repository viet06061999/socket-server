#!/bin/bash

# Find and kill the node process running the transfer server
pkill -f "node server.js"

echo "Transfer server stopped"
