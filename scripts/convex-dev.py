#!/usr/bin/env python3
"""
Script to run Convex development server with the specified configuration.
This script runs: npx convex dev --configure=existing --team abdurrahman-fakhrul --project superspace
"""

import subprocess
import sys
import os

def run_convex_dev():
    """Run the Convex development server with predefined configuration."""
    
    print("🚀 Starting Convex development server...")
    print("Team: abdurrahman-fakhrul")
    print("Project: superspace")
    print("Configuration: existing")
    print("" * 50)
    
    # Command to run
    cmd = [
        "npx", 
        "convex", 
        "dev", 
        "-configure=existing", 
        "-team", "abdurrahman-fakhrul", 
        "-project", "superspace"
    ]
    
    try:
        # Run the command and stream output in real-time
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Stream output line by line
        for line in process.stdout:
            print(line.rstrip())
        
        # Wait for process to complete
        process.wait()
        
        if process.returncode == 0:
            print("\n✅ Convex development server started successfully!")
        else:
            print(f"\n❌ Convex development server failed with exit code: {process.returncode}")
            sys.exit(process.returncode)
            
    except KeyboardInterrupt:
        print("\n🛑 Convex development server stopped by user")
        process.terminate()
        sys.exit(0)
    except FileNotFoundError:
        print("❌ Error: npx not found. Please make sure Node.js and npm are installed.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error running Convex development server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Check if we're in the right directory (should have package.json)
    if not os.path.exists("package.json"):
        print("❌ Error: package.json not found. Please run this script from the project root.")
        sys.exit(1)
    
    run_convex_dev()
