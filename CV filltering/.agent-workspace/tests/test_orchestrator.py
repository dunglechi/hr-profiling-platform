
# .agent-workspace/tests/test_orchestrator.py

import unittest
import os
import sys
import json
import tempfile
import shutil
import yaml
from unittest.mock import patch, mock_open

# Add the scripts directory to the Python path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'scripts'))
sys.path.insert(0, SCRIPTS_PATH)

from orchestrator import (
    load_configs,
    log_decision,
    find_next_task,
    process_task
)

class TestOrchestrator(unittest.TestCase):

    def setUp(self):
        """Set up a temporary directory and mock configs for testing."""
        self.test_dir = tempfile.mkdtemp()
        self.logs_path = os.path.join(self.test_dir, 'logs')
        self.config_path = os.path.join(self.test_dir, 'config')
        os.makedirs(self.logs_path)
        os.makedirs(self.config_path)

        self.mock_orchestration_config = {
            'workflow': {
                'states': {
                    'NEW': {
                        'transitions': [{
                            'to': 'PLANNING',
                            'action': 'plan_task',
                            'agent': 'GEMINI_CTO'
                        }]
                    }
                }
            }
        }
        self.mock_agent_roles_config = {'agents': []}

        with open(os.path.join(self.config_path, 'orchestration.yaml'), 'w') as f:
            yaml.dump(self.mock_orchestration_config, f)
        with open(os.path.join(self.config_path, 'agent-roles.yaml'), 'w') as f:
            yaml.dump(self.mock_agent_roles_config, f)

        # Mock paths used by the orchestrator script
        self.config_patcher = unittest.mock.patch('orchestrator.CONFIG_PATH', self.config_path)
        self.log_file_patcher = unittest.mock.patch('orchestrator.LOG_FILE', os.path.join(self.logs_path, 'decisions.log'))
        self.config_patcher.start()
        self.log_file_patcher.start()

    def tearDown(self):
        """Clean up the temporary directory."""
        shutil.rmtree(self.test_dir)
        self.config_patcher.stop()
        self.log_file_patcher.stop()

    def test_load_configs(self):
        """Tests that configuration files are loaded correctly."""
        orch_config, agent_config = load_configs()
        self.assertEqual(orch_config, self.mock_orchestration_config)
        self.assertEqual(agent_config, self.mock_agent_roles_config)

    def test_log_decision(self):
        """Tests that a decision is written to the log file."""
        log_file = os.path.join(self.logs_path, 'decisions.log')
        message = "Test decision"
        log_decision(message)
        
        self.assertTrue(os.path.exists(log_file))
        with open(log_file, 'r') as f:
            content = f.read()
        self.assertIn("[Orchestrator]: Test decision", content)

    def test_find_next_task(self):
        """Tests finding the correct task from a queue."""
        queue = [
            {'task_id': '1', 'status': 'DONE'},
            {'task_id': '2', 'status': 'NEW', 'priority': 3},
            {'task_id': '3', 'status': 'NEW', 'priority': 1}
        ]
        
        task, index = find_next_task(queue)
        
        self.assertIsNotNone(task)
        self.assertEqual(task['task_id'], '2') # Finds the first 'NEW' task
        self.assertEqual(index, 1)

    def test_find_next_task_no_new_task(self):
        """Tests behavior when no processable tasks are in the queue."""
        queue = [
            {'task_id': '1', 'status': 'DONE'},
            {'task_id': '2', 'status': 'PLANNING'}
        ]
        task, index = find_next_task(queue)
        self.assertIsNone(task)
        self.assertIsNone(index)

    def test_process_task_new_to_planning(self):
        """Tests the state transition from NEW to PLANNING."""
        # Arrange
        task = {
            'task_id': 'abc-123',
            'status': 'NEW',
            'history': []
        }
        configs = (self.mock_orchestration_config, self.mock_agent_roles_config)

        # Act
        updated_task = process_task(task, configs)

        # Assert
        self.assertEqual(updated_task['status'], 'PLANNING')
        self.assertEqual(len(updated_task['history']), 1)
        self.assertIn("State changed to PLANNING", updated_task['history'][0]['event'])

if __name__ == '__main__':
    unittest.main()
