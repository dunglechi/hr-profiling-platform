# .agent-workspace/scripts/scheduler.py
"""
Event-driven, queue-based task scheduler.

This script watches an 'inbox' directory for new task files. When a file
appears, it reads the content, formats it into a structured JSON task object,
and appends it to the main task queue (`main.json`).

It uses a file-based locking mechanism to prevent race conditions with the
Orchestrator.
"""

import os
import json
import uuid
import time
import sys
from datetime import datetime, timezone

# Define paths relative to the script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))

INBOX_PATH = os.path.join(WORKSPACE_DIR, 'queue', 'inbox')
QUEUE_FILE = os.path.join(WORKSPACE_DIR, 'queue', 'main.json')
QUEUE_LOCK_FILE = os.path.join(WORKSPACE_DIR, 'queue', 'main.json.lock')

POLL_INTERVAL = 5  # seconds

def acquire_lock(lock_file):
    """Acquire a file-based lock, waiting if necessary."""
    while os.path.exists(lock_file):
        time.sleep(0.1)
    # Create the lock file
    with open(lock_file, 'w') as f:
        f.write(str(os.getpid()))

def release_lock(lock_file):
    """Release the file-based lock."""
    if os.path.exists(lock_file):
        os.remove(lock_file)

def create_task_object(content: str) -> dict:
    """Creates a structured task object from raw content."""
    # Simple metadata parsing (can be extended)
    metadata = {}
    if "PreferredReviewer: CLAUDE" in content:
        metadata['PreferredReviewer'] = 'CLAUDE'

    return {
        "task_id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "NEW",
        "priority": 3, # Default priority
        "request": content,
        "history": [
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event": "Task created by Scheduler."
            }
        ],
        "metadata": metadata
    }

def process_inbox():
    """Scans the inbox, processes new files, and adds them to the queue."""
    if not os.path.exists(INBOX_PATH):
        os.makedirs(INBOX_PATH)
        print(f"Created inbox directory: {INBOX_PATH}")
        return

    task_files = [f for f in os.listdir(INBOX_PATH) if os.path.isfile(os.path.join(INBOX_PATH, f))]
    if not task_files:
        return

    print(f"Found {len(task_files)} new task(s) in inbox.")

    newly_created_tasks = []
    for filename in task_files:
        filepath = os.path.join(INBOX_PATH, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if content.strip():  # Ensure file is not empty
                task = create_task_object(content)
                newly_created_tasks.append(task)
                print(f"Prepared task {task['task_id']} for queue.")
            
            # Remove the processed file
            os.remove(filepath)

        except Exception as e:
            print(f"Error processing file {filename}: {e}", file=sys.stderr)

    # Only acquire lock and write to queue if there are new tasks
    if not newly_created_tasks:
        return

    acquire_lock(QUEUE_LOCK_FILE)
    try:
        # Read the current queue
        if os.path.exists(QUEUE_FILE):
            with open(QUEUE_FILE, 'r') as f:
                queue = json.load(f)
        else:
            queue = []

        queue.extend(newly_created_tasks)

        # Write the updated queue back to the file
        with open(QUEUE_FILE, 'w') as f:
            json.dump(queue, f, indent=2)
        print(f"Successfully added {len(newly_created_tasks)} task(s) to the queue.")

    finally:
        release_lock(QUEUE_LOCK_FILE)

def main():
    """Main loop for the scheduler."""
    print("--- Task Scheduler started ---")
    print(f"Watching inbox: {INBOX_PATH}")
    while True:
        try:
            process_inbox()
            time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            print("--- Task Scheduler stopped ---")
            break
        except Exception as e:
            print(f"An unexpected error occurred in the scheduler loop: {e}", file=sys.stderr)
            time.sleep(POLL_INTERVAL * 2) # Wait longer after an error

if __name__ == "__main__":
    main()