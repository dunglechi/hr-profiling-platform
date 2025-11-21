# .agent-workspace/tests/test_scheduler.py

import unittest
import os
import sys
import json
import tempfile
import shutil
import uuid

# Add the scripts directory to the Python path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'scripts'))
sys.path.insert(0, SCRIPTS_PATH)

from scheduler import (
    create_task_object,
    process_inbox,
    acquire_lock,
    release_lock
)

class TestScheduler(unittest.TestCase):

    def setUp(self):
        """Set up a temporary directory for testing."""
        self.test_dir = tempfile.mkdtemp()
        self.inbox_path = os.path.join(self.test_dir, 'inbox')
        self.queue_path = os.path.join(self.test_dir, 'queue')
        os.makedirs(self.inbox_path)
        os.makedirs(self.queue_path)

        # Mock the paths used by the scheduler script
        self.inbox_patcher = unittest.mock.patch('scheduler.INBOX_PATH', self.inbox_path)
        self.queue_file_patcher = unittest.mock.patch('scheduler.QUEUE_FILE', os.path.join(self.queue_path, 'main.json'))
        self.lock_file_patcher = unittest.mock.patch('scheduler.QUEUE_LOCK_FILE', os.path.join(self.queue_path, 'main.json.lock'))
        
        self.inbox_patcher.start()
        self.queue_file_patcher.start()
        self.lock_file_patcher.start()

    def tearDown(self):
        """Clean up the temporary directory."""
        shutil.rmtree(self.test_dir)
        self.inbox_patcher.stop()
        self.queue_file_patcher.stop()
        self.lock_file_patcher.stop()

    def test_create_task_object(self):
        """Tests the structure of the created task object."""
        content = "This is a test request.\nPreferredReviewer: CLAUDE"
        task = create_task_object(content)

        self.assertIn('task_id', task)
        self.assertIn('created_at', task)
        self.assertEqual(task['status'], 'NEW')
        self.assertEqual(task['request'], content)
        self.assertEqual(len(task['history']), 1)
        self.assertEqual(task['metadata']['PreferredReviewer'], 'CLAUDE')

    def test_process_inbox_creates_task(self):
        """Tests that a file in the inbox is processed into a task."""
        # Arrange
        task_content = "My test task"
        inbox_file_path = os.path.join(self.inbox_path, 'task1.txt')
        with open(inbox_file_path, 'w') as f:
            f.write(task_content)

        # Act
        process_inbox()

        # Assert
        self.assertFalse(os.path.exists(inbox_file_path)) # File should be deleted
        
        queue_file = os.path.join(self.queue_path, 'main.json')
        self.assertTrue(os.path.exists(queue_file))
        
        with open(queue_file, 'r') as f:
            queue = json.load(f)
        
        self.assertEqual(len(queue), 1)
        self.assertEqual(queue[0]['request'], task_content)

    def test_process_inbox_handles_empty_file(self):
        """Tests that an empty file in the inbox is ignored and removed."""
        # Arrange
        inbox_file_path = os.path.join(self.inbox_path, 'empty.txt')
        with open(inbox_file_path, 'w') as f:
            f.write("   ") # Whitespace only

        # Act
        process_inbox()

        # Assert
        self.assertFalse(os.path.exists(inbox_file_path)) # File should still be deleted
        queue_file = os.path.join(self.queue_path, 'main.json')
        self.assertFalse(os.path.exists(queue_file)) # Queue should not be created

    def test_locking(self):
        """Tests the basic creation and removal of the lock file."""
        lock_file = os.path.join(self.queue_path, 'main.json.lock')
        
        self.assertFalse(os.path.exists(lock_file))
        
        acquire_lock(lock_file)
        self.assertTrue(os.path.exists(lock_file))
        
        release_lock(lock_file)
        self.assertFalse(os.path.exists(lock_file))

if __name__ == '__main__':
    unittest.main()
