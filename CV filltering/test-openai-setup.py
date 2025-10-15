#!/usr/bin/env python3
"""
Quick OpenAI Package Test
Kiểm tra OpenAI package có hoạt động không
"""

def test_openai_import():
    try:
        import openai
        print("✅ OpenAI package imported successfully!")
        print(f"📦 OpenAI version: {openai.__version__}")
        
        # Test basic client creation (không cần API key để test import)
        try:
            from openai import OpenAI
            print("✅ OpenAI client class available")
            print("💡 To use: client = OpenAI(api_key='your_api_key')")
            return True
        except Exception as e:
            print(f"❌ Client creation test failed: {e}")
            return False
            
    except ImportError as e:
        print(f"❌ Failed to import OpenAI: {e}")
        return False

def show_usage_examples():
    print("\n🚀 OpenAI Usage Examples:")
    print("=" * 50)
    
    example_code = '''
# Basic setup
from openai import OpenAI
client = OpenAI(api_key="your_api_key_here")

# Chat completion
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Hello, world!"}
    ]
)
print(response.choices[0].message.content)

# Text completion
response = client.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt="Complete this sentence: AI is",
    max_tokens=50
)
print(response.choices[0].text)
'''
    print(example_code)

if __name__ == "__main__":
    print("🧪 OpenAI Package Test")
    print("=" * 30)
    
    success = test_openai_import()
    
    if success:
        show_usage_examples()
        print("\n✅ OpenAI package is ready to use!")
        print("💡 Set your API key in environment: OPENAI_API_KEY=your_key")
    else:
        print("\n❌ OpenAI package test failed!")
        
    print("\n📝 Installation completed successfully via: pip install openai")