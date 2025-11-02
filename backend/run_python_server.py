#!/usr/bin/env python3
"""
Script to run the FastAPI backend server
"""
import uvicorn
import os
import sys
from pathlib import Path

# Add backend directory to path so imports work
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    # Run on port 8000 to avoid conflict with Node.js backend on 5000
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir / "app")]
    )

