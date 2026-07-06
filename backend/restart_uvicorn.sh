#!/bin/bash

# --- 1. PROCESS IDENTIFICATION ---
# 'pgrep -f' directoly searchs the PID (Process ID).
# It's cleaner and aviod the problem of "ps aux | grep", that often captures the grep command itself.
PID=$(pgrep -f "uvicorn main:app")

# --- 2. KILLING EXISTING PROCESS ---
if [ -n "$PID" ]; then
    echo "Found Uvicorn process PID: $PID. killing..."
    # 'kill -9' sends SIGKILL signal, that force the process to close immediately
    kill -9 $PID
else
    echo "Nessun Uvicorn process found."
fi

# --- 3. VIRTUAL ENVIRONMENT ACTIVATION ---
# 'source' (o il punto '.') executes the script in the context of the current shell,
# allowing to load virtual enviroinmental variable (venv)
source venv/bin/activate

# --- 4. BACKGROUND RUN & REDIRECTING LOG ---
# 'nohup' (No Hang Up) allow process to keep running even if the terminal is closed or disconnected.
# '--host 0.0.0.0' server is accessible from any external address.
# '--port 8000' listening door.
# '>' redirects the standard output (stdout) in the uvicorn.log.
# '2>&1' redirects errors (stderr, identificato dal canale 2) in the same place of the stdout (channel 1).
# '&' final the entire command in background, giving back the terminal control.
echo "Lauching Uvircon..."
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > uvicorn.log 2>&1 &

echo "Uvicorn restarted successfully!"

# --- MANUALLY GIVE "chmod +x restart_uvicorn.sh" AND THEN "./restart_uvicorn.sh" ---
# --- OR LAUNCH WITH BASH "bash restart_uvicorn.sh" ---

