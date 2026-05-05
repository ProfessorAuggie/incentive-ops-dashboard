#!/usr/bin/env python
"""
Setup script for Incentive Operations Monitoring Dashboard
Initializes the project and generates sample data
"""

import sys
import os
import subprocess

def main():
    print("=" * 80)
    print("📊 INCENTIVE OPERATIONS MONITORING DASHBOARD - SETUP")
    print("=" * 80)
    print()
    
    # Check Python version
    print("✓ Checking Python version...")
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    print(f"  Python {sys.version.split()[0]} ✓")
    print()
    
    # Install dependencies
    print("✓ Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "-r", "requirements.txt"])
        print("  Dependencies installed ✓")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        sys.exit(1)
    print()
    
    # Generate sample data
    print("✓ Generating sample data...")
    try:
        from src.data_generator import generate_sample_data, save_to_database
        
        print("  Creating 500 sample records...")
        df = generate_sample_data(num_records=500)
        save_to_database(df)
        
        print(f"  ✓ Data saved successfully")
        print(f"    - Records: {len(df)}")
        print(f"    - Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"    - Employees: {df['employee_id'].nunique()}")
        print(f"    - Regions: {df['region'].nunique()}")
    except Exception as e:
        print(f"❌ Failed to generate data: {e}")
        sys.exit(1)
    print()
    
    # Create environment file if it doesn't exist
    if not os.path.exists('.env'):
        print("✓ Creating .env file...")
        with open('.env', 'w') as f:
            f.write("DATABASE_PATH=./data/incentive_payouts.db\n")
            f.write("DEBUG=False\n")
            f.write("SLA_THRESHOLD_DAYS=3\n")
        print("  .env file created ✓")
    print()
    
    # Summary
    print("=" * 80)
    print("✅ SETUP COMPLETE!")
    print("=" * 80)
    print()
    print("Next steps:")
    print()
    print("1. Start the dashboard:")
    print("   streamlit run app.py")
    print()
    print("2. Open in browser:")
    print("   http://localhost:8501")
    print()
    print("3. Click 'Load Data from Database' in sidebar")
    print()
    print("Documentation:")
    print("  - Quick Start: QUICKSTART.md")
    print("  - Full Guide: README.md")
    print()
    print("=" * 80)

if __name__ == "__main__":
    main()
