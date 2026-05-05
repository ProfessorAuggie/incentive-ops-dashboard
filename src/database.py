"""Database module for executing SQL queries"""
import sqlite3
import pandas as pd
from config import DATABASE_PATH

class DatabaseManager:
    """Manage database connections and queries"""
    
    def __init__(self, db_path=DATABASE_PATH):
        self.db_path = db_path
    
    def execute_query(self, query):
        """Execute a SQL query and return results as DataFrame"""
        try:
            conn = sqlite3.connect(self.db_path)
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df
        except Exception as e:
            print(f"Error executing query: {e}")
            return pd.DataFrame()
    
    def get_payout_mismatches(self):
        """Get payouts with amount mismatches"""
        query = """
        SELECT 
            employee_id,
            region,
            expected_payout,
            payout_amount,
            ROUND((payout_amount - expected_payout) / expected_payout * 100, 2) as variance_percent,
            processing_time,
            date,
            payout_status,
            CASE 
                WHEN ABS(payout_amount - expected_payout) > expected_payout * 0.1 THEN 'HIGH'
                WHEN ABS(payout_amount - expected_payout) > 0 THEN 'MEDIUM'
                ELSE 'LOW'
            END as severity
        FROM payouts
        WHERE payout_status = 'Paid'
            AND ABS(payout_amount - expected_payout) > 1
        ORDER BY variance_percent DESC
        """
        return self.execute_query(query)
    
    def get_sla_breaches(self):
        """Get payouts with SLA breaches"""
        query = """
        SELECT 
            employee_id,
            region,
            expected_payout,
            ROUND(processing_time, 2) as processing_hours,
            ROUND(processing_time / 24, 2) as processing_days,
            date,
            payout_status
        FROM payouts
        WHERE processing_time > 72
        ORDER BY processing_time DESC
        """
        return self.execute_query(query)
    
    def get_regional_performance(self):
        """Get performance metrics by region"""
        query = """
        SELECT 
            region,
            COUNT(*) as total_transactions,
            SUM(CASE WHEN payout_status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
            SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) as error_count,
            SUM(CASE WHEN payout_status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
            ROUND(SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate_percent,
            ROUND(SUM(payout_amount), 2) as total_amount,
            ROUND(AVG(processing_time), 2) as avg_processing_hours
        FROM payouts
        GROUP BY region
        ORDER BY error_rate_percent DESC
        """
        return self.execute_query(query)
    
    def get_delayed_payouts(self):
        """Get payouts with delays"""
        query = """
        SELECT 
            employee_id,
            region,
            expected_payout,
            payout_amount,
            ROUND(processing_time, 2) as processing_hours,
            date,
            payout_status,
            CASE 
                WHEN processing_time > 168 THEN '> 7 days'
                WHEN processing_time > 72 THEN '3-7 days'
                ELSE '< 3 days'
            END as delay_category
        FROM payouts
        WHERE processing_time > 72
        ORDER BY processing_time DESC
        """
        return self.execute_query(query)
    
    def get_kpi_summary(self):
        """Get overall KPI summary"""
        query = """
        SELECT 
            COUNT(*) as total_records,
            SUM(CASE WHEN payout_status = 'Paid' THEN 1 ELSE 0 END) as total_payouts_processed,
            SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) as total_errors,
            ROUND(SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate_percent,
            ROUND(SUM(payout_amount), 2) as total_amount_processed,
            ROUND(AVG(processing_time), 2) as avg_processing_time_hours
        FROM payouts
        """
        result = self.execute_query(query)
        return result.iloc[0].to_dict() if not result.empty else {}
    
    def get_pending_payouts(self):
        """Get all pending payouts"""
        query = """
        SELECT 
            employee_id,
            region,
            expected_payout,
            ROUND(processing_time, 2) as processing_hours,
            date as initiated_date,
            CASE 
                WHEN processing_time > 72 THEN 'URGENT'
                WHEN processing_time > 48 THEN 'WARNING'
                ELSE 'NORMAL'
            END as alert_level
        FROM payouts
        WHERE payout_status = 'Pending'
        ORDER BY processing_time DESC
        """
        return self.execute_query(query)
    
    def get_employee_history(self, employee_id):
        """Get history for specific employee"""
        query = f"""
        SELECT 
            employee_id,
            region,
            expected_payout,
            payout_amount,
            processing_time,
            date,
            payout_status
        FROM payouts
        WHERE employee_id = {employee_id}
        ORDER BY date DESC
        """
        return self.execute_query(query)
    
    def get_daily_trend(self, days=30):
        """Get daily trend data"""
        query = f"""
        SELECT 
            DATE(date) as process_date,
            COUNT(*) as daily_transactions,
            SUM(CASE WHEN payout_status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
            SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) as error_count,
            ROUND(AVG(processing_time), 2) as avg_processing_hours,
            ROUND(SUM(payout_amount), 2) as daily_total
        FROM payouts
        WHERE date >= datetime('now', '-{days} days')
        GROUP BY DATE(date)
        ORDER BY process_date DESC
        """
        return self.execute_query(query)
