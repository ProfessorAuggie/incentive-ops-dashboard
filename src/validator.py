"""Payout validation and error detection module"""
import pandas as pd
import numpy as np
from datetime import datetime
from config import ERROR_PAYOUT_THRESHOLD, DELAY_THRESHOLD_HOURS, SLA_THRESHOLD_DAYS, ERROR_CLASSIFICATIONS

class PayoutValidator:
    """Validates and detects errors in payout data"""
    
    def __init__(self, df):
        self.df = df.copy()
        self.errors = []
        self.warnings = []
    
    def validate_payouts(self):
        """Run all validation checks"""
        self._check_amount_mismatch()
        self._check_delayed_payouts()
        self._check_sla_breaches()
        self._check_pending_payouts()
        
        return self._create_error_dataframe()
    
    def _check_amount_mismatch(self):
        """Check for mismatches between expected and actual payout"""
        mismatches = self.df[
            (self.df['payout_status'] == 'Paid') & 
            (abs(self.df['payout_amount'] - self.df['expected_payout']) > 1)
        ]
        
        for idx, row in mismatches.iterrows():
            variance = ((row['payout_amount'] - row['expected_payout']) / row['expected_payout'] * 100)
            self.errors.append({
                'employee_id': int(row['employee_id']),
                'region': row['region'],
                'error_type': 'AMOUNT_ISSUE',
                'error_classification': ERROR_CLASSIFICATIONS['AMOUNT_ISSUE'],
                'description': f"Payout mismatch: Expected ${row['expected_payout']:.2f}, Got ${row['payout_amount']:.2f} ({variance:+.1f}%)",
                'expected_payout': row['expected_payout'],
                'actual_payout': row['payout_amount'],
                'variance_percent': variance,
                'processing_time_hours': row['processing_time'],
                'date': row['date'],
                'severity': 'HIGH' if abs(variance) > 20 else 'MEDIUM'
            })
    
    def _check_delayed_payouts(self):
        """Check for delayed payouts"""
        delayed = self.df[
            (self.df['payout_status'] == 'Paid') & 
            (self.df['processing_time'] > DELAY_THRESHOLD_HOURS)
        ]
        
        for idx, row in delayed.iterrows():
            self.errors.append({
                'employee_id': int(row['employee_id']),
                'region': row['region'],
                'error_type': 'DELAY_ISSUE',
                'error_classification': ERROR_CLASSIFICATIONS['DELAY_ISSUE'],
                'description': f"Delayed payout: Processed in {row['processing_time']:.1f} hours (threshold: {DELAY_THRESHOLD_HOURS}h)",
                'expected_payout': row['expected_payout'],
                'actual_payout': row['payout_amount'],
                'variance_percent': 0,
                'processing_time_hours': row['processing_time'],
                'date': row['date'],
                'severity': 'MEDIUM'
            })
    
    def _check_sla_breaches(self):
        """Check for SLA breaches (processing > 3 days)"""
        sla_breaches = self.df[
            (self.df['processing_time'] > SLA_THRESHOLD_DAYS * 24)
        ]
        
        for idx, row in sla_breaches.iterrows():
            if row['payout_status'] != 'Error':
                days = row['processing_time'] / 24
                self.errors.append({
                    'employee_id': int(row['employee_id']),
                    'region': row['region'],
                    'error_type': 'DELAY_ISSUE',
                    'error_classification': 'SLA Breach',
                    'description': f"SLA Breach: Processing took {days:.1f} days (SLA: {SLA_THRESHOLD_DAYS} days)",
                    'expected_payout': row['expected_payout'],
                    'actual_payout': row['payout_amount'],
                    'variance_percent': 0,
                    'processing_time_hours': row['processing_time'],
                    'date': row['date'],
                    'severity': 'HIGH'
                })
    
    def _check_pending_payouts(self):
        """Check for pending payouts"""
        pending = self.df[self.df['payout_status'] == 'Pending']
        
        for idx, row in pending.iterrows():
            self.errors.append({
                'employee_id': int(row['employee_id']),
                'region': row['region'],
                'error_type': 'DELAY_ISSUE',
                'error_classification': 'Pending Payout',
                'description': f"Payout still pending: {row['processing_time']:.1f} hours elapsed",
                'expected_payout': row['expected_payout'],
                'actual_payout': row['payout_amount'],
                'variance_percent': 0,
                'processing_time_hours': row['processing_time'],
                'date': row['date'],
                'severity': 'MEDIUM'
            })
    
    def _create_error_dataframe(self):
        """Convert errors list to DataFrame"""
        if not self.errors:
            return pd.DataFrame(columns=[
                'employee_id', 'region', 'error_type', 'error_classification',
                'description', 'expected_payout', 'actual_payout', 'variance_percent',
                'processing_time_hours', 'date', 'severity'
            ])
        
        return pd.DataFrame(self.errors)

def get_error_summary(errors_df):
    """Generate summary statistics from errors"""
    if errors_df.empty:
        return {
            'total_errors': 0,
            'by_type': {},
            'by_severity': {},
            'by_region': {}
        }
    
    return {
        'total_errors': len(errors_df),
        'by_type': errors_df['error_type'].value_counts().to_dict(),
        'by_severity': errors_df['severity'].value_counts().to_dict(),
        'by_region': errors_df['region'].value_counts().to_dict()
    }
