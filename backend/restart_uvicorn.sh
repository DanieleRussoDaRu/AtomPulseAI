#!/bin/bash

# --- 1. IDENTIFICATION AND PROCESS KILL ---
# Cerca solo i processi reali di uvicorn escludendo lo script corrente.
PID=$(pgrep -f "uvicorn main:app" | grep -v $$)

if [ -n "$PID" ]; then
    echo "Found uvicorn PID: $PID. killing..."
    kill -9 $PID
    sleep 1 #Idle for 1 sec
else
    echo "No uvicorn process found."
fi

# --- 2. BACKGROUND START WITH ABS PATH/RELATIVE OF VENV ---
echo "Launching uvicorn..."

# Pointing directly at venv/bin/uvicorn, Python use automatically
# virtual environment libraries
nohup ./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > uvicorn.log 2>&1 &

# 1 sec wait to check if it's still running
sleep 1
if ps -p $! > /dev/null; then
    echo "Uvicorn restarted succesfully! PID: $!"
else
    echo "Error: Uvicorn crashed after start. Check uvicorn.log"
fi