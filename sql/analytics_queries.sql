-- SQL Analytics Queries for Incentive Operations Monitoring Dashboard

-- 1. Error Detection: Payout Mismatches
-- Identify payouts where actual amount differs significantly from expected
SELECT 
    employee_id,
    region,
    expected_payout,
    payout_amount,
    ROUND(((payout_amount - expected_payout) / expected_payout) * 100, 2) as variance_percent,
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
ORDER BY variance_percent DESC;

-- 2. SLA Breach Detection
-- Identify payouts processed beyond SLA threshold (3 days = 72 hours)
SELECT 
    employee_id,
    region,
    expected_payout,
    ROUND(processing_time, 2) as processing_hours,
    ROUND(processing_time / 24, 2) as processing_days,
    date,
    payout_status,
    CASE 
        WHEN processing_time > 72 THEN 'BREACH'
        ELSE 'COMPLIANT'
    END as sla_status
FROM payouts
WHERE processing_time > 72
ORDER BY processing_time DESC;

-- 3. Regional Performance Analysis
-- Aggregate metrics by region
SELECT 
    region,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN payout_status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
    SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) as error_count,
    SUM(CASE WHEN payout_status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
    ROUND(SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate_percent,
    ROUND(SUM(payout_amount), 2) as total_amount,
    ROUND(AVG(processing_time), 2) as avg_processing_hours,
    ROUND(MAX(processing_time), 2) as max_processing_hours
FROM payouts
GROUP BY region
ORDER BY error_rate_percent DESC;

-- 4. Delayed Payouts Analysis
-- Identify payouts with processing time > threshold
SELECT 
    employee_id,
    region,
    expected_payout,
    payout_amount,
    ROUND(processing_time, 2) as processing_hours,
    date,
    payout_status,
    CASE 
        WHEN processing_time > 72 AND processing_time <= 168 THEN '3-7 days'
        WHEN processing_time > 168 THEN '> 7 days'
        ELSE '< 3 days'
    END as delay_category
FROM payouts
WHERE processing_time > 72
ORDER BY processing_time DESC;

-- 5. Error Type Classification
-- Categorize errors
SELECT 
    COUNT(*) as error_count,
    CASE 
        WHEN payout_status = 'Error' THEN 'System Error'
        WHEN ABS(payout_amount - expected_payout) > expected_payout * 0.05 THEN 'Amount Mismatch'
        WHEN processing_time > 72 THEN 'Processing Delay'
        ELSE 'Other'
    END as error_type,
    region,
    ROUND(AVG(processing_time), 2) as avg_processing_time
FROM payouts
WHERE payout_status IN ('Error', 'Pending') 
    OR ABS(payout_amount - expected_payout) > 1
GROUP BY error_type, region
ORDER BY error_count DESC;

-- 6. KPI Summary
-- Overall performance metrics
SELECT 
    COUNT(*) as total_records,
    SUM(CASE WHEN payout_status = 'Paid' THEN 1 ELSE 0 END) as total_payouts_processed,
    SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) as total_errors,
    ROUND(SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate_percent,
    ROUND(SUM(payout_amount), 2) as total_amount_processed,
    ROUND(AVG(processing_time), 2) as avg_processing_time_hours,
    ROUND(MIN(processing_time), 2) as min_processing_time,
    ROUND(MAX(processing_time), 2) as max_processing_time
FROM payouts;

-- 7. Employee Issue History
-- Track individual employee performance
SELECT 
    employee_id,
    region,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) as error_count,
    ROUND(SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate,
    ROUND(AVG(processing_time), 2) as avg_processing_time,
    ROUND(SUM(CASE WHEN payout_status = 'Paid' THEN payout_amount ELSE 0 END), 2) as total_paid,
    ROUND(SUM(CASE WHEN payout_status = 'Paid' THEN expected_payout ELSE 0 END), 2) as total_expected
FROM payouts
GROUP BY employee_id, region
HAVING error_count > 0
ORDER BY error_rate DESC;

-- 8. Processing Time Trend
-- Daily aggregated metrics
SELECT 
    DATE(date) as process_date,
    COUNT(*) as daily_transactions,
    SUM(CASE WHEN payout_status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
    SUM(CASE WHEN payout_status = 'Error' THEN 1 ELSE 0 END) as error_count,
    ROUND(AVG(processing_time), 2) as avg_processing_hours,
    ROUND(SUM(payout_amount), 2) as daily_total
FROM payouts
GROUP BY DATE(date)
ORDER BY process_date DESC
LIMIT 30;

-- 9. Pending Payouts Alert
-- List all pending payouts
SELECT 
    employee_id,
    region,
    expected_payout,
    ROUND(processing_time, 2) as processing_hours,
    date as initiated_date,
    CASE 
        WHEN processing_time > 72 THEN 'URGENT - SLA Breach'
        WHEN processing_time > 48 THEN 'WARNING - Approaching SLA'
        ELSE 'NORMAL'
    END as alert_level
FROM payouts
WHERE payout_status = 'Pending'
ORDER BY processing_time DESC;

-- 10. Amount Summary by Region and Status
-- Financial summary
SELECT 
    region,
    payout_status,
    COUNT(*) as transaction_count,
    ROUND(SUM(expected_payout), 2) as total_expected,
    ROUND(SUM(payout_amount), 2) as total_actual,
    ROUND(SUM(payout_amount) - SUM(expected_payout), 2) as variance,
    ROUND((SUM(payout_amount) - SUM(expected_payout)) / SUM(expected_payout) * 100, 2) as variance_percent
FROM payouts
GROUP BY region, payout_status
ORDER BY region, payout_status;
