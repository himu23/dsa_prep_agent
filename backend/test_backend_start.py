#!/usr/bin/env python3
"""Test if backend can start without errors"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    print("Testing imports...")
    from app.main import app
    print("✅ Main app imported")
    
    from app.cf_client import get_topic_statistics, fetch_user_info
    print("✅ CF client imported")
    
    from app.smart_planner import generate_recommendations_from_stats
    print("✅ Smart planner imported")
    
    print("\n✅ All imports successful!")
    print("\nYou can start the server with:")
    print("  python run_python_server.py")
    print("  OR")
    print("  uvicorn app.main:app --host 0.0.0.0 --port 8000")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

