# .agent-workspace/scripts/claude_adapter.py
"""
Adapter for on-demand, stateless calls to the Anthropic Claude API.

This script provides a single function, `get_claude_review`, to get a high-quality
review or analysis from a Claude model. It is designed to be called by the
Orchestrator when a task requires deep reasoning.
"""

import os
import sys
import anthropic
from dotenv import load_dotenv

# Add project root to sys.path to allow loading .env from the root directory
# This makes the script runnable from any location.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)
load_dotenv(os.path.join(project_root, '.env'))

def get_claude_review(
    prompt: str,
    model: str = "claude-3-sonnet-20240229"
) -> str:
    """
    Gets a review from the Anthropic Claude API.

    Args:
        prompt: The detailed prompt/question for Claude.
        model: The Claude model to use (e.g., "claude-3-opus-20240229").

    Returns:
        The text content of Claude's response.

    Raises:
        ValueError: If the ANTHROPIC_API_KEY is not set.
        anthropic.APIError: For errors during the API call.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not found.")

    try:
        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model=model,
            max_tokens=4096,  # Generous token limit for deep reasoning
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        if message.content and len(message.content) > 0:
            # Assuming the primary response is in the first content block
            return message.content[0].text
        else:
            return "" # Return empty string if no content is received

    except anthropic.APIError as e:
        print(f"An error occurred while calling the Claude API: {e}", file=sys.stderr)
        raise
    except Exception as e:
        print(f"An unexpected error occurred in claude_adapter: {e}", file=sys.stderr)
        raise

if __name__ == '__main__':
    """
    Provides a simple command-line interface for testing the adapter.    
    Usage:
        python .agent-workspace/scripts/claude_adapter.py "Your prompt for Claude"
    
    Example:
        python .agent-workspace/scripts/claude_adapter.py "Review this Python code for potential race conditions: [code]"
    """
    if len(sys.argv) > 1:
        test_prompt = sys.argv[1]
        print("---" + " Sending test prompt to Claude ---")
        print(f"Prompt: {test_prompt}\n")
        try:
            response = get_claude_review(test_prompt)
            print("---" + " Claude's Response ---")
            print(response)
            print("\n---" + " Test complete ---")
        except (ValueError, anthropic.APIError) as e:
            print(f"Test failed: {e}", file=sys.stderr)
    else:
        print("Usage: python claude_adapter.py \"Your prompt for Claude\"")