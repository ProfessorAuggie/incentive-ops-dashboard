# Architecture & System Design

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   STREAMLIT FRONTEND                     │
│  (Interactive Dashboard & User Interface)               │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│              APPLICATION LOGIC LAYER                      │
├──────────────────────────────────────────────────────────┤
│  • KPI Tracker (kpi_tracker.py)                          │
│  • Validator (validator.py)                             │
│  • Reporter (reporter.py)                               │
│  • Database Manager (database.py)                       │
│  • Data Generator (data_generator.py)                   │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│                   DATA LAYER                              │
├──────────────────────────────────────────────────────────┤
│  • SQLite Database (incentive_payouts.db)               │
│  • Payouts Table                                         │
│  • Indexes on key columns                               │
└──────────────────────────────────────────────────────────┘
```

---

## 📚 Module Structure

### 1. **app.py** - Main Application
- Streamlit UI framework
- Page navigation and routing
- Session state management
- Real-time interactions

### 2. **src/data_generator.py** - Data Management
- Generate synthetic payout data
- Save to SQLite database
- Load existing data
- Create realistic error patterns

### 3. **src/validator.py** - Data Validation
- `PayoutValidator` class
- Check payout mismatches
- Detect delayed payments
- Identify SLA breaches
- Error classification

### 4. **src/kpi_tracker.py** - KPI Calculation
- `KPITracker` class
- Calculate overall KPIs
- Regional performance metrics
- SLA metrics
- Daily trends
- Employee metrics

### 5. **src/reporter.py** - Report Generation
- `ReportGenerator` class
- Export CSV reports
- Generate text summaries
- Create regional breakdowns
- Executive summaries

### 6. **src/database.py** - Database Access
- `DatabaseManager` class
- Execute SQL queries
- Get analytical results
- Fetch specific data subsets

### 7. **sql/analytics_queries.sql** - Query Library
- 10 pre-built SQL queries
- Reusable analytics
- Complex aggregations

### 8. **config.py** - Configuration
- Centralized settings
- SLA thresholds
- Error thresholds
- Region definitions
- Status definitions

---

## 🔄 Data Flow

### On Dashboard Load
```
1. User loads app.py
2. Session state initializes
3. Sidebar offers data loading options
   ├─ Load from database (if exists)
   └─ Generate new sample data
4. PayoutValidator validates data
5. KPITracker calculates metrics
6. Dashboard displays results
```

### On Error Detection
```
1. User clicks "🚨 Error Detection"
2. PayoutValidator.validate_payouts() runs
3. Returns errors DataFrame with:
   ├─ Amount mismatches
   ├─ Delayed payouts
   ├─ SLA breaches
   └─ Pending payouts
4. Errors displayed with filtering options
5. Charts show distribution by severity/type
```

### On Report Generation
```
1. User clicks "Generate Summary Report"
2. ReportGenerator initializes
3. Generates three files:
   ├─ error_log.csv
   ├─ summary_report.txt
   └─ regional_breakdown.csv
4. Files saved to reports/ directory
5. User can download or view
```

---

## 🗄️ Database Design

### Single Table: `payots`

**Columns:**
- `employee_id` (INTEGER) - FK to employee
- `region` (TEXT) - "North", "South", etc.
- `expected_payout` (REAL) - Planned amount
- `payout_amount` (REAL) - Actual amount
- `payout_status` (TEXT) - "Paid", "Pending", "Error"
- `processing_time` (REAL) - Hours taken
- `date` (DATETIME) - Transaction date
- `created_at` (DATETIME) - Init timestamp
- `processed_at` (DATETIME) - Completion timestamp

**Why Single Table?**
- Simple data model
- Easy joins (none needed)
- Fast queries
- Easy horizontal scaling

---

## 🔴 Error Detection Logic

### Amount Mismatch Check
```python
DIFFERENCE = ABS(actual - expected)
IF DIFFERENCE > $1:
    error_type = "AMOUNT_ISSUE"
    variance_percent = (DIFFERENCE / expected) * 100
    severity = "HIGH" if variance > 20% else "MEDIUM"
```

### Delay Check
```python
IF processing_time > 72 hours:
    error_type = "DELAY_ISSUE"
    severity = "MEDIUM"
```

### SLA Breach Check
```python
IF processing_time > 72 hours AND status != "Paid":
    error_type = "DELAY_ISSUE"
    error_classification = "SLA Breach"
    severity = "HIGH"
```

### Status Error Check
```python
IF status = "Error":
    error_type = "SYSTEM_ERROR"
    severity = "HIGH"
```

---

## 📊 KPI Calculation Engine

### Overall KPIs
```python
total_payouts = COUNT(status="Paid")
error_rate = (COUNT errors / total records) * 100
incorrect_rate = (COUNT amount_mismatch / total) * 100
delayed_rate = (COUNT delayed / total) * 100
avg_time = AVG(processing_time WHERE status="Paid")
```

### Regional KPIs
```python
FOR EACH region:
    total_amount = SUM(payout_amount)
    error_count = COUNT(in error)
    error_rate = errors / total * 100
    avg_time = AVG(processing_time)
    delayed_count = COUNT(delayed)
```

### SLA Metrics
```python
SLA_THRESHOLD = 72 hours (3 days)
sla_breaches = COUNT(processing_time > 72)
sla_compliance = (compliant / total) * 100
```

---

## 🔐 Security & Best Practices

### Input Validation
- SQL injection protection (parameterized queries)
- Type checking on inputs
- Range validation on thresholds

### Error Handling
- Try-catch on database operations
- Graceful error messages
- Logging on failures

### Data Privacy
- No sensitive data stored (sample data only)
- Environment-based configuration
- .gitignore protects secrets

### Performance
- Database indexes on key columns
- Efficient pandas operations
- Caching of computed values

---

## 🚀 Scalability Considerations

### Current Architecture (Sample)
- Single SQLite database
- ~500 records
- In-memory processing
- Real-time calculation

### Future Scaling Options
1. **Data Volume**
   - Move to PostgreSQL/MySQL
   - Add partitioning by date
   - Archive old data

2. **Processing**
   - Schedule batch calculations
   - Redis caching
   - Async processing

3. **Reporting**
   - Scheduled report generation
   - Email delivery
   - Historical trends DB

4. **UI**
   - Streamlit Multi-page (already done)
   - Caching with @st.cache_data
   - Progressive loading

---

## 📈 Feature Evolution

### Version 1.0 (Current)
- ✅ Single table database
- ✅ Real-time validation
- ✅ KPI dashboard
- ✅ Error classification
- ✅ Employee drill-down
- ✅ Report generation

### Future Enhancements
- [ ] Predictive error detection
- [ ] Automated remediation
- [ ] Email alerts
- [ ] Power BI integration
- [ ] Mobile app
- [ ] API endpoints

---

## 🧪 Testing Strategy

### Unit Tests (src/tests/)
```python
test_data_generator.py
    - test_generate_data()
    - test_data_shape()
    - test_error_injection()

test_validator.py
    - test_mismatch_detection()
    - test_sla_detection()
    - test_error_classification()

test_kpi_tracker.py
    - test_overall_kpis()
    - test_regional_kpis()
    - test_sla_metrics()
```

### Integration Tests
- Database read/write
- Dashboard load time
- Report generation

### Manual Testing
- Different data ranges
- Edge cases (0 records, all errors)
- Concurrent users

---

## 🔄 Update & Maintenance

### Regular Tasks
- Daily: Review error reports
- Weekly: Archive old data
- Monthly: Verify SLA targets
- Quarterly: Performance review

### Database Maintenance
```bash
# Backup
sqlite3 data/incentive_payouts.db .backup data/backup.db

# Optimize
sqlite3 data/incentive_payouts.db VACUUM

# Verify
sqlite3 data/incentive_payouts.db PRAGMA integrity_check
```

---

## 📚 Code Quality

### Standards
- PEP 8 compliance
- Type hints where helpful
- Docstrings on classes/functions
- Comments on complex logic

### Documentation
- Function docstrings
- Class docstrings
- SQL query comments
- Configuration comments

---

This architecture supports the current needs while remaining flexible for future enhancements!
