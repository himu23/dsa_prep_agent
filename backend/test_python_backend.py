#!/usr/bin/env python3
"""Test script to diagnose Python backend issues"""
import sys
import os

print("Testing Python backend dependencies...")
print("=" * 50)

# Test imports
try:
    import fastapi
    print("✅ fastapi installed")
except ImportError as e:
    print(f"❌ fastapi not installed: {e}")
    sys.exit(1)

try:
    import uvicorn
    print("✅ uvicorn installed")
except ImportError as e:
    print(f"❌ uvicorn not installed: {e}")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    print("✅ python-dotenv installed")
except ImportError as e:
    print(f"❌ python-dotenv not installed: {e}")
    sys.exit(1)

# Test app import
try:
    print("\nTesting app imports...")
    sys.path.insert(0, os.path.dirname(__file__))
    
    from app.main import app
    print("✅ app.main imported successfully")
    
    from app.cf_client import fetch_user_submissions
    print("✅ app.cf_client imported successfully")
    
    from app.analyzer import analyze_submission_with_llm
    print("✅ app.analyzer imported successfully")
    
    from app.planner import plan_next_problems
    print("✅ app.planner imported successfully")
    
    print("\n✅ All imports successful!")
    print("\nYou can start the server with:")
    print("  python run_python_server.py")
    print("  OR")
    print("  uvicorn app.main:app --host 0.0.0.0 --port 8000")
    
except Exception as e:
    print(f"\n❌ Import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

