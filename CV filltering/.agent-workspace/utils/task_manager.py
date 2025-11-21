"""
Task Manager with File Locking and Dependency Tracking
Implements critical improvements from evaluation feedback
"""

import os
import time
import yaml
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

class FileLock:
    """Simple file-based locking mechanism"""

    def __init__(self, lock_dir: str = ".agent-workspace/locks"):
        self.lock_dir = Path(lock_dir)
        self.lock_dir.mkdir(parents=True, exist_ok=True)

    def acquire(self, resource: str, timeout: int = 60, retries: int = 5) -> bool:
        """
        Acquire lock for a resource

        Args:
            resource: Name of resource (e.g., 'dev1.queue')
            timeout: Stale lock timeout in seconds
            retries: Number of retry attempts

        Returns:
            True if lock acquired, False otherwise
        """
        lock_file = self.lock_dir / f"{resource}.lock"

        for attempt in range(retries):
            if not lock_file.exists():
                # Create lock
                self._create_lock(lock_file)
                return True

            # Check if stale
            if self._is_stale(lock_file, timeout):
                print(f"Removing stale lock: {lock_file}")
                self._remove_lock(lock_file)
                continue

            # Wait and retry
            print(f"Lock exists, waiting... (attempt {attempt + 1}/{retries})")
            time.sleep(2)

        return False

    def release(self, resource: str) -> None:
        """Release lock for a resource"""
        lock_file = self.lock_dir / f"{resource}.lock"
        self._remove_lock(lock_file)

    def _create_lock(self, lock_file: Path) -> None:
        """Create lock file with metadata"""
        lock_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "process": "task_manager",
            "operation": "write"
        }
        with open(lock_file, 'w') as f:
            json.dump(lock_data, f)

    def _remove_lock(self, lock_file: Path) -> None:
        """Remove lock file if exists"""
        try:
            lock_file.unlink(missing_ok=True)
        except Exception as e:
            print(f"Error removing lock: {e}")

    def _is_stale(self, lock_file: Path, timeout: int) -> bool:
        """Check if lock is stale (older than timeout)"""
        try:
            with open(lock_file, 'r') as f:
                lock_data = json.load(f)

            lock_time = datetime.fromisoformat(lock_data['timestamp'])
            age = (datetime.now(timezone.utc) - lock_time).total_seconds()

            return age > timeout
        except:
            return True  # Treat invalid locks as stale


class DependencyTracker:
    """Track and manage task dependencies"""

    def __init__(self, state_file: str = ".agent-workspace/state/dependencies.json"):
        self.state_file = Path(state_file)
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        self.dependencies = self._load()

    def _load(self) -> Dict:
        """Load dependency state"""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {}

    def _save(self) -> None:
        """Save dependency state"""
        with open(self.state_file, 'w') as f:
            json.dump(self.dependencies, f, indent=2)

    def add_task(self, task_id: str, dependencies: Dict[str, List[str]]) -> None:
        """
        Add task with dependencies

        Args:
            task_id: Task identifier
            dependencies: Dict with 'required', 'optional', 'parallel' lists
        """
        self.dependencies[task_id] = {
            "required": dependencies.get("required", []),
            "optional": dependencies.get("optional", []),
            "parallel": dependencies.get("parallel", []),
            "status": "PENDING",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self._save()

    def can_execute(self, task_id: str) -> tuple[bool, str]:
        """
        Check if task can be executed

        Returns:
            (can_execute, reason)
        """
        if task_id not in self.dependencies:
            return True, "No dependencies"

        deps = self.dependencies[task_id]

        # Check required dependencies
        for req_task in deps.get("required", []):
            if req_task not in self.dependencies:
                return False, f"Required dependency {req_task} not found"

            req_status = self.dependencies[req_task].get("status")
            if req_status != "COMPLETED":
                return False, f"Required dependency {req_task} not completed (status: {req_status})"

        return True, "All dependencies satisfied"

    def mark_completed(self, task_id: str) -> None:
        """Mark task as completed"""
        if task_id in self.dependencies:
            self.dependencies[task_id]["status"] = "COMPLETED"
            self.dependencies[task_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
            self._save()

    def mark_failed(self, task_id: str) -> None:
        """Mark task as failed"""
        if task_id in self.dependencies:
            self.dependencies[task_id]["status"] = "FAILED"
            self.dependencies[task_id]["failed_at"] = datetime.now(timezone.utc).isoformat()
            self._save()

    def get_blocked_tasks(self, failed_task_id: str) -> List[str]:
        """Get list of tasks blocked by a failed task"""
        blocked = []
        for task_id, deps in self.dependencies.items():
            if failed_task_id in deps.get("required", []):
                blocked.append(task_id)
        return blocked

    def generate_mermaid_graph(self) -> str:
        """Generate Mermaid diagram of dependencies"""
        lines = ["```mermaid", "graph TD"]

        for task_id, deps in self.dependencies.items():
            status = deps.get("status", "PENDING")

            # Node style based on status
            if status == "COMPLETED":
                lines.append(f"    {task_id}[{task_id}]:::completed")
            elif status == "FAILED":
                lines.append(f"    {task_id}[{task_id}]:::failed")
            else:
                lines.append(f"    {task_id}[{task_id}]")

            # Add dependencies
            for req in deps.get("required", []):
                lines.append(f"    {req} -->|required| {task_id}")

            for opt in deps.get("optional", []):
                lines.append(f"    {opt} -.->|optional| {task_id}")

        # Add styles
        lines.extend([
            "    classDef completed fill:#90EE90",
            "    classDef failed fill:#FFB6C1",
            "```"
        ])

        return "\n".join(lines)


class TaskManager:
    """Main task manager with locking and dependency support"""

    def __init__(self):
        self.lock = FileLock()
        self.deps = DependencyTracker()

    def write_task(self, agent: str, task: Dict) -> bool:
        """
        Safely write task to agent queue with locking

        Args:
            agent: Agent name (dev1, dev2, cto)
            task: Task dictionary

        Returns:
            True if successful
        """
        queue_file = f".agent-workspace/queue/inbox/{agent}.queue"
        resource_name = f"{agent}.queue"

        # Acquire lock
        if not self.lock.acquire(resource_name):
            print(f"Failed to acquire lock for {resource_name}")
            return False

        try:
            # Add dependencies if specified
            task_id = task.get("task_id")
            if "dependencies" in task and task_id:
                self.deps.add_task(task_id, task["dependencies"])

            # Check if can execute
            if task_id:
                can_exec, reason = self.deps.can_execute(task_id)
                if not can_exec:
                    task["status"] = "BLOCKED"
                    task["blocked_reason"] = reason
                    print(f"Task {task_id} blocked: {reason}")

            # Write task
            with open(queue_file, 'a') as f:
                yaml.dump([task], f)

            print(f"✅ Task written to {queue_file}")
            return True

        finally:
            # Always release lock
            self.lock.release(resource_name)

    def mark_task_completed(self, task_id: str, result_file: str) -> None:
        """
        Mark task as completed and update dependencies

        Args:
            task_id: Task identifier
            result_file: Path to result file
        """
        # Update dependency tracker
        self.deps.mark_completed(task_id)

        # Generate updated dependency graph
        graph = self.deps.generate_mermaid_graph()

        # Write to monitoring
        graph_file = Path(".agent-workspace/monitoring/dependencies.md")
        with open(graph_file, 'w') as f:
            f.write("# Task Dependency Graph\n\n")
            f.write(f"Last updated: {datetime.now(timezone.utc).isoformat()}\n\n")
            f.write(graph)

        print(f"✅ Task {task_id} marked as completed")

    def mark_task_failed(self, task_id: str, error: str) -> List[str]:
        """
        Mark task as failed and get blocked tasks

        Returns:
            List of tasks that are now blocked
        """
        self.deps.mark_failed(task_id)
        blocked = self.deps.get_blocked_tasks(task_id)

        if blocked:
            print(f"⚠️ Task {task_id} failure blocks: {blocked}")

        return blocked

    def check_health(self) -> Dict[str, Any]:
        """
        Perform health check on task system

        Returns:
            Health status dictionary
        """
        health = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "HEALTHY",
            "issues": []
        }

        # Check for stale locks
        lock_dir = Path(".agent-workspace/locks")
        if lock_dir.exists():
            stale_locks = []
            for lock_file in lock_dir.glob("*.lock"):
                if self.lock._is_stale(lock_file, 60):
                    stale_locks.append(lock_file.name)

            if stale_locks:
                health["issues"].append(f"Stale locks found: {stale_locks}")
                health["status"] = "WARNING"

        # Check dependency graph
        all_tasks = self.deps.dependencies
        blocked_count = sum(1 for t in all_tasks.values() if t.get("status") == "BLOCKED")
        failed_count = sum(1 for t in all_tasks.values() if t.get("status") == "FAILED")

        if blocked_count > 0:
            health["issues"].append(f"{blocked_count} tasks blocked")

        if failed_count > 2:
            health["issues"].append(f"{failed_count} tasks failed")
            health["status"] = "WARNING"

        health["summary"] = {
            "total_tasks": len(all_tasks),
            "blocked": blocked_count,
            "failed": failed_count,
            "completed": sum(1 for t in all_tasks.values() if t.get("status") == "COMPLETED")
        }

        return health


# Example usage
if __name__ == "__main__":
    # Initialize manager
    tm = TaskManager()

    # Create a task with dependencies
    task = {
        "task_id": "TASK-002",
        "priority": "HIGH",
        "type": "IMPL",
        "title": "Deploy to Render",
        "dependencies": {
            "required": ["TASK-001"],  # Must wait for verification tests
            "optional": [],
            "parallel": []
        },
        "details": "Deploy backend to Render after tests pass"
    }

    # Write task (will check dependencies)
    success = tm.write_task("dev1", task)

    if success:
        print("Task written successfully")
    else:
        print("Failed to write task")

    # Check system health
    health = tm.check_health()
    print(f"\nSystem Health: {health['status']}")
    print(f"Summary: {health['summary']}")
