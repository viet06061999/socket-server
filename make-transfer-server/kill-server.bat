@echo off
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Transfer Server"
echo Transfer server stopped
