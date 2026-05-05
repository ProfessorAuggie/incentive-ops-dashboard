# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies (1 min)
```bash
pip install -r requirements.txt
```

### 2. Generate Sample Data (30 sec)
```bash
python src/data_generator.py
```

You should see:
```
✓ Data saved to ./data/incentive_payouts.db
```

### 3. Start Dashboard (30 sec)
```bash
streamlit run app.py
```

### 4. View in Browser (Open automatically)
Dashboard opens at: `http://localhost:8501`

---

## 📊 First Actions

### Step 1: Load Data
In the dashboard sidebar, click **"Load Data from Database"**

### Step 2: Explore Dashboard
Click **"📌 Dashboard"** to see KPIs:
- Total payouts
- Error rate
- Processing time
- Regional breakdown

### Step 3: Check Errors
Click **"🚨 Error Detection"** to see:
- What went wrong
- Which regions affected
- Severity levels

### Step 4: Drill Down
Click **"👥 Employee Drill-Down"** to:
- Select an employee
- View their history
- Check SLA status

### Step 5: Generate Reports
Click **"📤 Reports"** to:
- Create summary report
- Export error logs
- Download data

---

## 💡 Key Features to Try

### Feature 1: SLA Tracking
🎤 **Say**: "I tracked SLA breaches in payout processing."

Go to **KPI Analytics** → See SLA metrics
- Compliance rate (target: > 95%)
- Days overdue
- Regions with issues

### Feature 2: Error Classification
🎤 **Say**: "System categorizes errors into 4 types."

Go to **Error Detection** → See breakdown:
- DATA_ISSUE (amount mismatch)
- DELAY_ISSUE (slow processing)
- AMOUNT_ISSUE (wrong amounts)
- SYSTEM_ERROR (failures)

### Feature 3: Error Rate KPI (Management Dashboard)
🎤 **Say**: "I show % incorrect payouts and % delayed payouts."

Dashboard has:
- ✅ Incorrect Payout Rate (%)
- ⏱️ Delayed Payout Rate (%)
- 🚨 Error Rate (%)

### Feature 4: Drill-Down Capability
🎤 **Say**: "Click region → see employees → see issue details."

Employee Page Features:
- Select employee dropdown
- View payment history
- See SLA status
- Identify patterns

### Feature 5: Automated Report Output
🎤 **Say**: "System supports operational reporting and decision-making."

Reports Page:
- Generate executive summary
- Export error logs (CSV)
- Download full dataset
- Share with stakeholders

---

## 🔍 Example Scenarios

### Scenario 1: Find High-Error Region
1. Go to **Error Detection**
2. Look at "Errors by Region" chart
3. Click on region with highest errors
4. See specific issues

### Scenario 2: Investigate Employee
1. Go to **Employee Drill-Down**
2. Select employee with problems
3. View payment history
4. Check if SLA breached

### Scenario 3: Generate Management Report
1. Go to **Reports**
2. Click "Generate Summary Report"
3. Download CSV
4. Share metrics with team

### Scenario 4: Track SLA Compliance
1. Go to **KPI Analytics**
2. Check SLA Compliance Rate
3. See which regions have issues
4. Identify trends

---

## 📊 Understanding the Metrics

### Error Rate
- Shows % of total records with issues
- Lower is better
- Target: < 2%

### Incorrect Payout Rate
- % where amount doesn't match expected
- Lower is better
- Target: < 1%

### Delayed Payout Rate
- % exceeding 3-day SLA
- Lower is better
- Target: < 5%

### Processing Time
- Average hours to complete
- Lower is better
- Target: < 24 hours

### SLA Compliance
- % completed within 3 days
- Higher is better
- Target: > 95%

---

## 🛠️ Customization

### Change SLA Threshold
Edit `config.py`:
```python
SLA_THRESHOLD_DAYS = 3  # Change to your threshold
```

### Add New Region
Edit `config.py`:
```python
REGIONS = ['North', 'South', 'East', 'West', 'Central', 'NewRegion']
```

### Generate More Data
```bash
python src/data_generator.py  # Overwrites with 500 new records
```

---

## 📱 Deploying to Vercel

### Option 1: Streamlit Cloud (Easiest)
1. Push code to GitHub
2. Go to https://streamlit.io/cloud
3. Click "New App"
4. Select your repo
5. Deploy!

### Option 2: Deploy from Terminal
```bash
vercel deploy
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "No database" | Click "Generate Sample Data" |
| "Import error" | Run `pip install -r requirements.txt` |
| "Slow loading" | Use filters to reduce data |
| "Database locked" | Delete `data/incentive_payouts.db` and regenerate |

---

## 📞 Need Help?

1. Check the main README.md
2. Look at error messages
3. Try regenerating data
4. Check config.py for settings

---

**Ready to go! 🚀**

You now have a production-ready incentive monitoring system!
