"""Data generation module for sample incentive payout data"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sqlite3
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import REGIONS, PAYOUT_STATUSES, DATABASE_PATH

def generate_sample_data(num_records=500, seed=42):
    """
    Generate sample incentive payout data
    
    Args:
        num_records: Number of records to generate
        seed: Random seed for reproducibility
    
    Returns:
        DataFrame with payout data
    """
    np.random.seed(seed)
    
    # Base date
    base_date = datetime.now() - timedelta(days=90)
    
    data = {
        'employee_id': np.random.randint(1001, 1201, num_records),
        'region': np.random.choice(REGIONS, num_records),
        'expected_payout': np.random.uniform(1000, 10000, num_records).round(2),
        'payout_status': np.random.choice(PAYOUT_STATUSES, num_records, p=[0.7, 0.15, 0.15]),
        'date': [base_date + timedelta(days=int(x)) for x in np.random.uniform(0, 90, num_records)],
    }
    
    df = pd.DataFrame(data)
    
    # Generate actual payout amount with some errors
    df['payout_amount'] = df['expected_payout'].copy()
    
    # Introduce some errors
    error_indices = np.random.choice(df.index, size=int(0.1 * num_records), replace=False)
    for idx in error_indices:
        error_type = np.random.choice(['overpay', 'underpay', 'wrong_amount'])
        if error_type == 'overpay':
            df.loc[idx, 'payout_amount'] = df.loc[idx, 'expected_payout'] * np.random.uniform(1.05, 1.5)
        elif error_type == 'underpay':
            df.loc[idx, 'payout_amount'] = df.loc[idx, 'expected_payout'] * np.random.uniform(0.5, 0.95)
        else:
            df.loc[idx, 'payout_amount'] = np.random.uniform(1000, 10000)
        df.loc[idx, 'payout_status'] = 'Error'
    
    df['payout_amount'] = df['payout_amount'].round(2)
    
    # Generate processing time (in hours)
    df['processing_time'] = np.random.exponential(scale=24, size=num_records)
    
    # Add SLA breaches
    sla_indices = np.random.choice(df.index, size=int(0.08 * num_records), replace=False)
    for idx in sla_indices:
        df.loc[idx, 'processing_time'] = np.random.uniform(72, 200)  # More than 3 days
        if df.loc[idx, 'payout_status'] != 'Error':
            df.loc[idx, 'payout_status'] = 'Pending'
    
    df['processing_time'] = df['processing_time'].round(2)
    
    # Add created_at timestamp (when payout was initiated)
    df['created_at'] = df['date']
    
    # Add processed_at timestamp (if paid)
    def calc_processed_at(row):
        if row['payout_status'] == 'Paid':
            return row['date'] + timedelta(hours=row['processing_time'])
        elif row['payout_status'] == 'Pending':
            return None
        return row['date']
    
    df['processed_at'] = df.apply(calc_processed_at, axis=1)
    
    # Reorder columns
    columns = ['employee_id', 'region', 'expected_payout', 'payout_amount', 
               'payout_status', 'processing_time', 'date', 'created_at', 'processed_at']
    df = df[columns]
    
    return df

def save_to_database(df, database_path=DATABASE_PATH):
    """Save dataframe to SQLite database"""
    os.makedirs(os.path.dirname(database_path), exist_ok=True)
    
    conn = sqlite3.connect(database_path)
    df.to_sql('payouts', conn, if_exists='replace', index=False)
    conn.close()
    
    print(f"✓ Data saved to {database_path}")

def load_from_database(database_path=DATABASE_PATH):
    """Load data from SQLite database"""
    conn = sqlite3.connect(database_path)
    df = pd.read_sql_query("SELECT * FROM payouts", conn)
    conn.close()
    
    # Convert date columns
    df['date'] = pd.to_datetime(df['date'])
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['processed_at'] = pd.to_datetime(df['processed_at'])
    
    return df

if __name__ == "__main__":
    print("Generating sample data...")
    df = generate_sample_data(num_records=500)
    print(f"Generated {len(df)} records")
    print(f"\nFirst few records:\n{df.head()}")
    
    print("\nSaving to database...")
    save_to_database(df)
    
    print("\nData summary:")
    print(df.describe())
    print(f"\nPayouts by status:\n{df['payout_status'].value_counts()}")
    print(f"\nPayouts by region:\n{df['region'].value_counts()}")
