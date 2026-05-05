# Incentive Operations Monitoring Dashboard

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.25%2B-red)](https://streamlit.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

A comprehensive operational analytics dashboard designed to monitor incentive payouts, detect errors, validate data accuracy, and optimize processing efficiency. Built with Python, Streamlit, and SQL for real-time insights.

## 🎯 Mission

**"Ensure operational efficiency and accuracy in incentive payment systems through real-time monitoring, error detection, and data-driven insights."**

---

## 🚀 Features

### ✅ Real-Time Payout Validation
- Automated comparison between expected and actual payouts
- Detection of amount mismatches with variance tracking
- Instant flagging of discrepancies

### 🚨 Intelligent Error Detection
- **Amount Mismatches**: Incorrect payout detection
- **Processing Delays**: Identify slow payouts
- **SLA Breaches**: Track 3-day SLA violations
- **Error Severity Classification**: HIGH, MEDIUM, LOW priority

### ⏱️ SLA Tracking (VERY IMPRESSIVE)
- Monitor processing time against 3-day SLA
- Track SLA compliance by region
- Identify repeat violators
- Historical trend analysis

### 📊 Comprehensive KPI Dashboard
- Total payouts processed
- Error rate tracking
- Incorrect payout rate
- Delayed payout rate
- Average processing time
- Pending payouts count

### 📍 Regional Performance Analysis
- Region-wise error rates
- Processing time comparisons
- Total amount by region
- Best/worst performing regions

### 👥 Employee Drill-Down Capability
- Individual performance metrics
- Payment history tracking
- Error patterns
- SLA compliance per employee

### 📤 Automated Report Output
- Executive summary generation
- Error log exports (CSV)
- Regional breakdown reports
- Daily trend analysis
- Categorized error exports

### 🎨 Interactive Dashboard UI
- Clean, modern Streamlit interface
- Real-time metric updates
- Interactive charts and visualizations
- Multi-page navigation

---

## 📊 Dashboard Views

### 📌 Dashboard Page
- KPI cards (total, error rate, processing time)
- Performance metrics
- Regional performance charts
- Daily processing trend

### 🚨 Error Detection Page
- Error classification breakdown
- Severity analysis
- Detailed error log with filtering
- Regional error distribution

### 📈 KPI Analytics Page
- SLA compliance tracking
- Regional KPI metrics
- Error rate charts
- Processing time distribution

### 👥 Employee Drill-Down
- Employee selection
- Personal KPIs
- Payment history
- Trend charts

### 📤 Reports Page
- Generate summary reports
- Download error logs
- Export full dataset
- Executive summary

### ⚙️ Settings Page
- Configuration info
- SLA settings
- Feature overview

---

## 🏗️ Project Structure

```
Incentive-Operations-Monitoring-Dashboard/
├── app.py                          # Main Streamlit app
├── config.py                       # Configuration
├── requirements.txt                # Dependencies
│
├── src/
│   ├── data_generator.py          # Data generation
│   ├── validator.py                # Validation engine
│   ├── kpi_tracker.py              # KPI calculations
│   ├── reporter.py                 # Report generation
│   └── database.py                 # Database queries
│
├── sql/
│   └── analytics_queries.sql       # SQL library
│
├── data/
│   └── incentive_payouts.db        # SQLite database
│
├── reports/
│   ├── error_log.csv
│   ├── summary_report.txt
│   └── regional_breakdown.csv
│
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- pip or conda

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Generate Sample Data
```bash
python src/data_generator.py
```

### Step 3: Run Dashboard
```bash
streamlit run app.py
```

Dashboard opens at `http://localhost:8501`

---

## 📖 Usage Guide

### First Time
1. Click "Generate Sample Data"
2. System runs validation automatically
3. Navigate pages to explore

### Daily Workflow
1. **Dashboard**: Check overnight errors
2. **Error Detection**: Investigate issues
3. **KPI Analytics**: Compare regions
4. **Employee Drill-Down**: Check specific employees
5. **Reports**: Export for management

### Common Tasks

**Finding Regional Issues**
- Go to KPI Analytics
- Review error rates by region

**Investigating Employee Problems**
- Go to Employee Drill-Down
- Select employee
- View history and SLA status

**Generating Reports**
- Go to Reports
- Click "Generate Summary Report"
- Download CSV

**Exporting Data**
- Go to Reports
- Click "Export All Data"

---

## 🔍 Error Classification

### 1. DATA_ISSUE
- Amount mismatch (variance > 5%)
- Expected vs actual payout

### 2. DELAY_ISSUE
- Processing > 72 hours (3 days)
- SLA threshold violation
- Pending payouts

### 3. AMOUNT_ISSUE
- Incorrect amount calculation
- Payment amount error

### 4. SYSTEM_ERROR
- Payment marked "Error"
- Critical failure
- Gateway/bank rejection

---

## 📊 Key KPIs

| KPI | Definition | Target |
|-----|-----------|--------|
| Error Rate | % of errors in system | < 2% |
| Incorrect Payouts | % with amount mismatch | < 1% |
| Delayed Payouts | % exceeding SLA | < 5% |
| Processing Time | Average hours | < 24h |
| SLA Compliance | % within 3 days | > 95% |

---

## 🗄️ Database Schema

```sql
CREATE TABLE payouts (
    employee_id INTEGER,
    region TEXT,
    expected_payout REAL,
    payout_amount REAL,
    payout_status TEXT,
    processing_time REAL,
    date DATETIME,
    created_at DATETIME,
    processed_at DATETIME
);
```

---

## 📁 SQL Queries

Located in `sql/analytics_queries.sql`:

1. Payout Mismatches
2. SLA Breaches
3. Regional Performance
4. Delayed Payouts
5. Error Classification
6. KPI Summary
7. Employee History
8. Daily Trends
9. Pending Alerts
10. Amount Summary

---

## 🚀 Deployment to Vercel

### Option 1: Streamlit Cloud (Recommended)
1. Push to GitHub
2. Go to https://streamlit.io/cloud
3. Connect repo
4. Deploy!

### Option 2: Vercel
Create `vercel.json`:
```json
{
  "buildCommand": "pip install -r requirements.txt",
  "outputDirectory": "."
}
```

Deploy:
```bash
vercel deploy
```

---

## 📈 Sample Data

The generator creates:
- 500 records
- 200 employees (1001-1200)
- 5 regions
- $1,000-$10,000 payouts
- 70% Paid, 15% Pending, 15% Error
- 10% have mismatches
- 8% have SLA breaches

---

## 🔧 Configuration

Edit `config.py`:
```python
SLA_THRESHOLD_DAYS = 3
ERROR_PAYOUT_THRESHOLD = 0.05
DELAY_THRESHOLD_HOURS = 72
REGIONS = ['North', 'South', 'East', 'West', 'Central']
```

---

## 🐛 Troubleshooting

**No database**
- Click "Generate Sample Data"

**ModuleNotFoundError**
- Run: `pip install -r requirements.txt`

**Database locked**
- Run: `rm data/incentive_payouts.db`
- Regenerate data

**Slow dashboard**
- Use filters
- Reduce date range

---

## 💡 Operational Insights

✅ Real-Time Errors - Instant detection  
⏱️ SLA Compliance - 3-day targets  
💰 Financial Accuracy - Amount validation  
📍 Regional Performance - Regional issues  
👥 Employee Patterns - Problematic employees  

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Error Rate | < 2% |
| SLA Compliance | > 95% |
| Avg Processing | < 24h |
| Incorrect Payouts | < 1% |
| Pending | < 5% |

---

**Built with ❤️ for Operational Excellence**