"""Configuration management for the dashboard"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_PATH = os.getenv('DATABASE_PATH', './data/incentive_payouts.db')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# SLA Configuration (in days)
SLA_THRESHOLD_DAYS = int(os.getenv('SLA_THRESHOLD_DAYS', 3))

# Error Thresholds
ERROR_PAYOUT_THRESHOLD = float(os.getenv('ERROR_PAYOUT_THRESHOLD', 0.05))
DELAY_THRESHOLD_HOURS = int(os.getenv('DELAY_THRESHOLD_HOURS', 72))

# Regions
REGIONS = ['North', 'South', 'East', 'West', 'Central']

# Payout Status
PAYOUT_STATUSES = ['Paid', 'Pending', 'Error']

# Error Classifications
ERROR_CLASSIFICATIONS = {
    'DATA_ISSUE': 'Data Quality Issue (Mismatch)',
    'DELAY_ISSUE': 'Processing Delay',
    'AMOUNT_ISSUE': 'Incorrect Amount',
    'SYSTEM_ERROR': 'System Error'
}
