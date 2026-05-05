"""KPI and SLA tracking module"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from config import SLA_THRESHOLD_DAYS, DELAY_THRESHOLD_HOURS

class KPITracker:
    """Calculate and track key performance indicators"""
    
    def __init__(self, df):
        self.df = df.copy()
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.df['created_at'] = pd.to_datetime(self.df['created_at'])
        self.df['processed_at'] = pd.to_datetime(self.df['processed_at'])
    
    def get_overall_kpis(self):
        """Calculate overall KPIs"""
        total_processed = len(self.df[self.df['payout_status'] == 'Paid'])
        total_records = len(self.df)
        
        # Amount calculations
        total_payouts = self.df[self.df['payout_status'] == 'Paid']['payout_amount'].sum()
        expected_total = self.df[self.df['payout_status'] == 'Paid']['expected_payout'].sum()
        
        # Error calculations
        error_records = self.df[self.df['payout_status'] == 'Error']
        delayed_records = self.df[
            (self.df['processing_time'] > DELAY_THRESHOLD_HOURS) & 
            (self.df['payout_status'].isin(['Paid', 'Pending']))
        ]
        
        amount_mismatches = self.df[
            (self.df['payout_status'] == 'Paid') & 
            (abs(self.df['payout_amount'] - self.df['expected_payout']) > 1)
        ]
        
        # Error rates
        error_rate = (len(error_records) / total_records * 100) if total_records > 0 else 0
        incorrect_rate = (len(amount_mismatches) / total_records * 100) if total_records > 0 else 0
        delayed_rate = (len(delayed_records) / total_records * 100) if total_records > 0 else 0
        
        # Processing time
        paid_records = self.df[self.df['payout_status'] == 'Paid']
        avg_processing_time = paid_records['processing_time'].mean() if len(paid_records) > 0 else 0
        
        # Pending count
        pending_count = len(self.df[self.df['payout_status'] == 'Pending'])
        
        return {
            'total_payouts_processed': total_processed,
            'total_amount_processed': total_payouts,
            'expected_total_amount': expected_total,
            'total_records': total_records,
            'error_rate_percent': round(error_rate, 2),
            'incorrect_payout_rate_percent': round(incorrect_rate, 2),
            'delayed_payout_rate_percent': round(delayed_rate, 2),
            'avg_processing_time_hours': round(avg_processing_time, 2),
            'pending_payouts': pending_count,
            'error_records': len(error_records)
        }
    
    def get_regional_kpis(self):
        """Calculate regional performance metrics"""
        regions = self.df['region'].unique()
        regional_data = []
        
        for region in regions:
            region_df = self.df[self.df['region'] == region]
            total_records = len(region_df)
            paid_records = region_df[region_df['payout_status'] == 'Paid']
            
            error_records = region_df[region_df['payout_status'] == 'Error']
            delayed_records = region_df[
                (region_df['processing_time'] > DELAY_THRESHOLD_HOURS) & 
                (region_df['payout_status'].isin(['Paid', 'Pending']))
            ]
            
            avg_processing = paid_records['processing_time'].mean() if len(paid_records) > 0 else 0
            total_amount = paid_records['payout_amount'].sum()
            
            regional_data.append({
                'region': region,
                'total_payouts': len(paid_records),
                'total_amount': total_amount,
                'error_count': len(error_records),
                'error_rate_percent': round(len(error_records) / total_records * 100, 2) if total_records > 0 else 0,
                'delayed_count': len(delayed_records),
                'delayed_rate_percent': round(len(delayed_records) / total_records * 100, 2) if total_records > 0 else 0,
                'avg_processing_hours': round(avg_processing, 2)
            })
        
        return pd.DataFrame(regional_data).sort_values('error_rate_percent', ascending=False)
    
    def get_sla_metrics(self):
        """Calculate SLA breach metrics"""
        sla_threshold_hours = SLA_THRESHOLD_DAYS * 24
        
        sla_breaches = self.df[self.df['processing_time'] > sla_threshold_hours]
        on_time_deliveries = self.df[self.df['processing_time'] <= sla_threshold_hours]
        
        total = len(self.df)
        sla_compliance = round(len(on_time_deliveries) / total * 100, 2) if total > 0 else 0
        
        return {
            'sla_threshold_days': SLA_THRESHOLD_DAYS,
            'sla_threshold_hours': sla_threshold_hours,
            'total_sla_breaches': len(sla_breaches),
            'sla_compliance_rate_percent': sla_compliance,
            'on_time_deliveries': len(on_time_deliveries),
            'avg_breach_time_hours': round(sla_breaches['processing_time'].mean(), 2) if len(sla_breaches) > 0 else 0,
            'max_processing_time_hours': round(self.df['processing_time'].max(), 2),
            'min_processing_time_hours': round(self.df['processing_time'].min(), 2)
        }
    
    def get_daily_trend(self, days=30):
        """Get daily trend data for processing time"""
        recent_df = self.df[self.df['date'] >= (datetime.now() - timedelta(days=days))]
        
        daily_stats = recent_df.groupby(pd.to_datetime(recent_df['date']).dt.date).agg({
            'payout_amount': 'sum',
            'processing_time': 'mean',
            'payout_status': lambda x: (x == 'Error').sum()
        }).reset_index()
        
        daily_stats.columns = ['date', 'daily_payout_sum', 'avg_processing_time', 'error_count']
        
        return daily_stats
    
    def get_employee_metrics(self, employee_id):
        """Get metrics for a specific employee"""
        emp_df = self.df[self.df['employee_id'] == employee_id]
        
        if emp_df.empty:
            return None
        
        return {
            'employee_id': int(employee_id),
            'region': emp_df['region'].iloc[0],
            'total_payouts': len(emp_df[emp_df['payout_status'] == 'Paid']),
            'total_amount': emp_df[emp_df['payout_status'] == 'Paid']['payout_amount'].sum(),
            'error_count': len(emp_df[emp_df['payout_status'] == 'Error']),
            'avg_processing_time': round(emp_df['processing_time'].mean(), 2),
            'has_sla_breach': (emp_df['processing_time'] > SLA_THRESHOLD_DAYS * 24).any(),
            'payout_history': emp_df.to_dict('records')
        }
