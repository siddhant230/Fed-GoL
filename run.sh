#!/bin/sh
set -e

# Configuration
VENV_DIR=".venv"
PORT=8090
PID_FILE="pid.txt"


# Function to check if the process is actually running
is_process_running() {
    local pid=$1
    if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
        # Also verify it's our Flask app
        if ps -p "$pid" -o command= | grep -q "python main.py"; then
            return 1  # Process is running
        fi
    fi
    return 0  # Process is not running
}


# Function to check if Flask is responding
is_flask_responding() {
    if curl -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
        return 0  # Flask is responding
    fi
    return 1  # Flask is not responding
}


# Check if we need to start the app
need_to_start=1

# Check if there's an existing process
if [ -f "$PID_FILE" ]; then
    EXISTING_PID=$(cat "$PID_FILE")
    echo "Found existing PID (PID: $EXISTING_PID)"
    if is_process_running "$EXISTING_PID"; then
        echo "Flask application is already running (PID: $EXISTING_PID)"
        need_to_start=0
    else
        echo "Found stale PID file, will start new instance"
        rm "$PID_FILE"
    fi
fi

# Only start if needed
if [ $need_to_start -eq 1 ]; then
    echo "Starting new Flask instance..."
    
    # Setup virtual environment if it doesn't exist
    
    if [ ! -d ".venv" ]; then
        echo "Virtual environment not found. Creating one..."
        uv venv -p 3.9 .venv
        echo "Virtual environment created successfully."
    else
        echo "Virtual environment already exists."
    fi

    . .venv/bin/activate

    uv pip install --upgrade -r requirements.txt --quiet

    # Start the Flask application in the background
    nohup python3 main.py &
    APP_PID=$!
    echo "$APP_PID" > "$PID_FILE"  # Save the PID

    # Wait a moment to ensure the app starts
    sleep 2

    # Verify the app started successfully
    if is_process_running "$APP_PID"; then
        echo "Application started successfully!"
        echo "PID: $APP_PID"
    else
        echo "Failed to start application. Check logs for details."
        rm -f "$PID_FILE"
        exit 1
    fi
    
    # deactivate the virtual environment
    deactivate
else
    echo "No action needed - application is already running"
fi