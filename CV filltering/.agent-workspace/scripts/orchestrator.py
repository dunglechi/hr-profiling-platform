# .agent-workspace/scripts/orchestrator.py
"""
The central orchestrator (CTO Brain).

This script is the core of the AI agent orchestration system. It continuously
polls the main task queue, selects the next available task, and routes it
through the defined workflow states based on `orchestration.yaml`.

It manages task state, logs all major decisions, and will eventually be
responsible for calling the appropriate AI agents (Copilot, Claude) to
perform the work.
"""

import os
import json
import time
import sys
import yaml
from datetime import datetime, timezone

# Define paths relative to the script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))

QUEUE_FILE = os.path.join(WORKSPACE_DIR, 'queue', 'main.json')
QUEUE_LOCK_FILE = os.path.join(WORKSPACE_DIR, 'queue', 'main.json.lock')

CONFIG_PATH = os.path.join(WORKSPACE_DIR, 'config')
LOG_FILE = os.path.join(WORKSPACE_DIR, 'logs', 'decisions.log')

POLL_INTERVAL = 5  # seconds

# --- Lock Management (identical to scheduler) ---
def acquire_lock(lock_file):
    """Acquire a file-based lock, waiting if necessary."""
    while os.path.exists(lock_file):
        time.sleep(0.1)
    with open(lock_file, 'w') as f:
        f.write(str(os.getpid()))

def release_lock(lock_file):
    """Release the file-based lock."""
    if os.path.exists(lock_file):
        os.remove(lock_file)

# --- Core Logic ---
def load_configs():
    """Loads orchestration and agent role configurations."""
    try:
        with open(os.path.join(CONFIG_PATH, 'orchestration.yaml'), 'r') as f:
            orchestration_config = yaml.safe_load(f)
        with open(os.path.join(CONFIG_PATH, 'agent-roles.yaml'), 'r') as f:
            agent_roles_config = yaml.safe_load(f)
        return orchestration_config, agent_roles_config
    except FileNotFoundError as e:
        print(f"Error: Configuration file not found - {e}", file=sys.stderr)
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"Error: Could not parse YAML configuration - {e}", file=sys.stderr)
        sys.exit(1)

def log_decision(message: str):
    """Logs a major decision or state change."""
    timestamp = datetime.now(timezone.utc).isoformat()
    log_entry = f"{timestamp} [Orchestrator]: {message}\n"
    with open(LOG_FILE, 'a') as f:
        f.write(log_entry)
    print(log_entry.strip())

def find_next_task(queue: list) -> tuple[dict | None, int | None]:
    """Finds the first task in a processable state (e.g., 'NEW')."""
    for i, task in enumerate(queue):
        if task.get('status') == 'NEW':
            return task, i
    return None, None

def process_task(task: dict, configs: tuple):
    """Processes a single task based on its current state."""
    orchestration_config, _ = configs
    status = task['status']
    task_id = task['task_id']

    # Get the definition for the current state from the workflow
    state_def = orchestration_config['workflow']['states'].get(status)
    if not state_def:
        log_decision(f"Error: Task {task_id} has unknown status '{status}'. Skipping.")
        task['status'] = 'ERROR'
        return task

    # Find the first valid transition for the current state
    if 'transitions' in state_def and len(state_def['transitions']) > 0:
        transition = state_def['transitions'][0]
        next_status = transition['to']
        action = transition['action']
        agent = transition['agent']

        log_decision(f"Task {task_id}: Transitioning from {status} -> {next_status}.")
        task['status'] = next_status
        task['history'].append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": f"State changed to {next_status}. Action: {action}. Assigned to: {agent}."
        })

        # --- AGENT CALLING STUB ---
        # In the future, this is where calls to agents would happen.
        # For now, we just log the intended action.
        log_decision(f"Task {task_id}: STUB - Would now execute '{action}' using agent '{agent}'.")
        # --- END STUB ---

    else:
        log_decision(f"Task {task_id}: No further transitions from status '{status}'. Task considered complete for now.")
        # In a real scenario, you might move it to a final state like 'DONE'

    return task

def main_loop():
    """The main orchestrator processing loop."""
    configs = load_configs()
    log_decision("Orchestrator started. Configuration loaded.")

    while True:
        try:
            if not os.path.exists(QUEUE_FILE):
                time.sleep(POLL_INTERVAL)
                continue

            acquire_lock(QUEUE_LOCK_FILE)
            
            try:
                with open(QUEUE_FILE, 'r+') as f:
                    queue = json.load(f)
                    
                    task, index = find_next_task(queue)

                    if task:
                        updated_task = process_task(dict(task), configs)
                        queue[index] = updated_task
                        
                        # Write changes back to the queue file
                        f.seek(0)
                        f.truncate()
                        json.dump(queue, f, indent=2)
                    # else: no new tasks to process

            finally:
                release_lock(QUEUE_LOCK_FILE)

            time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            log_decision("Orchestrator stopped by user.")
            break
        except Exception as e:
            log_decision(f"CRITICAL ERROR in main loop: {e}")
            # Release lock in case of unexpected error
            if os.path.exists(QUEUE_LOCK_FILE):
                release_lock(QUEUE_LOCK_FILE)
            time.sleep(POLL_INTERVAL * 2)

def main():
    main_loop()

if __name__ == "__main__":
    main()