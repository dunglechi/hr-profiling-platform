
# .agent-workspace/tests/test_claude_adapter.py

import unittest
import os
import sys
from unittest.mock import patch, MagicMock
import anthropic

# Add the scripts directory to the Python path to allow imports
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'scripts'))
sys.path.insert(0, SCRIPTS_PATH)

# Now we can import the script we want to test
from claude_adapter import get_claude_review

class TestClaudeAdapter(unittest.TestCase):

    @patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test_key"})
    @patch('claude_adapter.anthropic.Anthropic')
    def test_get_claude_review_success(self, mock_anthropic_client):
        """Tests a successful call to the Claude API."""
        # Arrange
        mock_response = MagicMock()
        mock_response.content = [MagicMock()]
        mock_response.content[0].text = "This is a successful review."
        
        mock_client_instance = MagicMock()
        mock_client_instance.messages.create.return_value = mock_response
        mock_anthropic_client.return_value = mock_client_instance
        
        prompt = "Please review this code."

        # Act
        result = get_claude_review(prompt)

        # Assert
        self.assertEqual(result, "This is a successful review.")
        mock_client_instance.messages.create.assert_called_once_with(
            model="claude-3-sonnet-20240229",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

    @patch.dict(os.environ, {}, clear=True) # Ensure the key is not present
    def test_get_claude_review_no_api_key(self):
        """Tests that a ValueError is raised if the API key is missing."""
        # Arrange
        prompt = "This will fail."

        # Act & Assert
        with self.assertRaises(ValueError) as context:
            get_claude_review(prompt)
        self.assertIn("ANTHROPIC_API_KEY environment variable not found", str(context.exception))

    @patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test_key"})
    @patch('claude_adapter.anthropic.Anthropic')
    def test_get_claude_review_api_error(self, mock_anthropic_client):
        """Tests that an APIError from the client is propagated."""
        # Arrange
        mock_request = unittest.mock.Mock()
        mock_client_instance = MagicMock()
        api_error = anthropic.APIError("Test API Error", request=mock_request, body={})
        mock_client_instance.messages.create.side_effect = api_error
        mock_anthropic_client.return_value = mock_client_instance
        
        prompt = "This will also fail."

        # Act & Assert
        with self.assertRaises(anthropic.APIError):
            get_claude_review(prompt)

if __name__ == '__main__':
    unittest.main()

