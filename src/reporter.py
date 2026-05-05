"""Reporting and export module for error logs and summaries"""
import pandas as pd
from datetime import datetime
import os
from config import REGIONS

class ReportGenerator:
    """Generate and export operational reports"""
    
    def __init__(self, df, errors_df=None, kpis=None):
        self.df = df
        self.errors_df = errors_df if errors_df is not None else pd.DataFrame()
        self.kpis = kpis if kpis is not None else {}
        self.timestamp = datetime.now()
    
    def generate_error_log_csv(self, filepath='reports/error_log.csv'):
        """Export error log to CSV"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        if self.errors_df.empty:
            self.errors_df.to_csv(filepath, index=False)
            return filepath
        
        export_df = self.errors_df.copy()
        export_df.to_csv(filepath, index=False)
        return filepath
    
    def generate_summary_report_text(self, filepath='reports/summary_report.txt'):
        """Generate text summary report"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        report = []
        report.append("=" * 80)
        report.append("INCENTIVE OPERATIONS MONITORING DASHBOARD - SUMMARY REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Overall KPIs
        report.append("📊 OVERALL PERFORMANCE METRICS")
        report.append("-" * 80)
        if self.kpis:
            report.append(f"Total Payouts Processed: {self.kpis.get('total_payouts_processed', 0)}")
            report.append(f"Total Amount Processed: ${self.kpis.get('total_amount_processed', 0):,.2f}")
            report.append(f"Error Rate: {self.kpis.get('error_rate_percent', 0)}%")
            report.append(f"Incorrect Payout Rate: {self.kpis.get('incorrect_payout_rate_percent', 0)}%")
            report.append(f"Delayed Payout Rate: {self.kpis.get('delayed_payout_rate_percent', 0)}%")
            report.append(f"Average Processing Time: {self.kpis.get('avg_processing_time_hours', 0)} hours")
            report.append(f"Pending Payouts: {self.kpis.get('pending_payouts', 0)}")
            report.append(f"Total Errors: {self.kpis.get('error_records', 0)}")
        report.append("")
        
        # Error Summary
        report.append("🚨 ERROR SUMMARY")
        report.append("-" * 80)
        if not self.errors_df.empty:
            error_types = self.errors_df['error_type'].value_counts()
            for error_type, count in error_types.items():
                report.append(f"  {error_type}: {count} issues")
            
            report.append("")
            severity_counts = self.errors_df['severity'].value_counts()
            for severity, count in severity_counts.items():
                report.append(f"  {severity}: {count} issues")
        else:
            report.append("No errors detected! ✓")
        report.append("")
        
        # Regional Performance
        report.append("📍 REGIONAL PERFORMANCE")
        report.append("-" * 80)
        regional_errors = self.errors_df.groupby('region').size() if not self.errors_df.empty else pd.Series()
        for region in REGIONS:
            count = regional_errors.get(region, 0)
            report.append(f"  {region}: {count} errors")
        report.append("")
        
        # Top Issues
        report.append("⚠️  TOP ISSUES")
        report.append("-" * 80)
        if not self.errors_df.empty:
            top_issues = self.errors_df.nlargest(5, 'variance_percent' if 'variance_percent' in self.errors_df.columns else 'processing_time_hours')
            for idx, (_, issue) in enumerate(top_issues.iterrows(), 1):
                report.append(f"{idx}. {issue.get('description', 'Unknown issue')}")
                report.append(f"   Employee: {issue.get('employee_id', 'N/A')}, Region: {issue.get('region', 'N/A')}")
        else:
            report.append("No major issues to report! ✓")
        report.append("")
        
        # Recommendations
        report.append("💡 RECOMMENDATIONS")
        report.append("-" * 80)
        if not self.errors_df.empty:
            report.append("1. Review high-severity errors immediately")
            report.append("2. Investigate SLA breaches for process optimization")
            report.append("3. Implement data validation checks for amount mismatches")
            report.append("4. Monitor pending payouts daily")
        report.append("")
        report.append("=" * 80)
        
        report_text = "\n".join(report)
        
        # Save to file
        with open(filepath, 'w') as f:
            f.write(report_text)
        
        return filepath
    
    def generate_regional_breakdown(self, filepath='reports/regional_breakdown.csv'):
        \"\"\"Generate regional analysis CSV\"\"\"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        if self.errors_df.empty:
            return filepath
        
        regional_df = self.errors_df.groupby('region').agg({
            'employee_id': 'count',
            'expected_payout': 'sum',
            'actual_payout': 'sum',
            'processing_time_hours': 'mean'
        }).reset_index()
        
        regional_df.columns = ['region', 'error_count', 'total_expected', 'total_actual', 'avg_processing_hours']
        regional_df['variance_amount'] = regional_df['total_actual'] - regional_df['total_expected']
        
        regional_df.to_csv(filepath, index=False)
        return filepath
    
    def generate_executive_summary(self):
        \"\"\"Generate a quick executive summary dictionary\"\"\"
        summary = {
            'report_date': self.timestamp.strftime('%Y-%m-%d'),
            'total_errors': len(self.errors_df),
            'critical_issues': len(self.errors_df[self.errors_df['severity'] == 'HIGH']) if not self.errors_df.empty else 0,
            'error_rate': self.kpis.get('error_rate_percent', 0),
            'sla_compliance': 100 - self.kpis.get('delayed_payout_rate_percent', 0),
            'most_common_error': self.errors_df['error_type'].mode()[0] if not self.errors_df.empty else 'None',
            'affected_regions': list(self.errors_df['region'].unique()) if not self.errors_df.empty else []
        }
        
        return summary
    
    def get_all_reports_summary(self):
        \"\"\"Get summary of all available reports\"\"\"
        return {
            'error_log': 'reports/error_log.csv',
            'summary_report': 'reports/summary_report.txt',
            'regional_breakdown': 'reports/regional_breakdown.csv',
            'generated_at': self.timestamp.isoformat()
        }

def export_errors_by_category(errors_df, output_dir='reports'):
    \"\"\"Export errors categorized by type\"\"\"
    os.makedirs(output_dir, exist_ok=True)
    
    if errors_df.empty:
        return {}
    
    export_files = {}
    for error_type in errors_df['error_type'].unique():
        type_df = errors_df[errors_df['error_type'] == error_type]
        filepath = os.path.join(output_dir, f'{error_type.lower()}_errors.csv')
        type_df.to_csv(filepath, index=False)
        export_files[error_type] = filepath
    
    return export_files
