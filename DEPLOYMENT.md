# Deployment Guide

## 🚀 Deployment Options

This dashboard can be deployed to multiple platforms. Choose based on your needs.

---

## Option 1: Streamlit Cloud (Recommended - Easiest)

### Pros
- ✅ Free for public dashboards
- ✅ Auto-deploys from GitHub
- ✅ Zero configuration
- ✅ Automatic SSL/HTTPS
- ✅ Handles scaling

### Cons
- ❌ Limited to Streamlit Cloud restrictions
- ❌ Public unless you pay for private

### Steps

#### 1. Create GitHub Repository
```bash
# In your repo directory
git init
git add .
git commit -m "Initial commit: Incentive Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/incentive-dashboard.git
git push -u origin main
```

#### 2. Deploy to Streamlit Cloud
1. Go to https://streamlit.io/cloud
2. Click "New app"
3. Select: "From GitHub repo"
4. Choose repo: `YOUR-USERNAME/incentive-dashboard`
5. Main file path: `app.py`
6. Click "Deploy"

#### 3. Set Environment Variables
In Streamlit Cloud dashboard:
```
DATABASE_PATH = ./data/incentive_payouts.db
DEBUG = False
SLA_THRESHOLD_DAYS = 3
```

#### 4. Access Your Dashboard
```
https://incentive-dashboard-YOUR-USERNAME.streamlit.app
```

---

## Option 2: Vercel + Python Runtime

### Pros
- ✅ Widely trusted platform
- ✅ Custom domain support
- ✅ Good performance
- ✅ Great documentation

### Cons
- ❌ Requires serverless Python setup
- ❌ Database persistence challenges

### Steps

#### 1. Create `api/dashboard.py`
```python
from streamlit.web import cli
import sys

def handler(request):
    sys.argv = ["streamlit", "run", "app.py", "--server.headless", "true"]
    cli.main()
    return "OK"
```

#### 2. Create `vercel.json`
```json
{
  "buildCommand": "pip install -r requirements.txt",
  "outputDirectory": ".",
  "functions": {
    "api/dashboard.py": {
      "runtime": "python3.9"
    }
  }
}
```

#### 3. Deploy
```bash
npm install -g vercel
vercel login
vercel deploy
```

---

## Option 3: Docker + Cloud Run / Heroku

### Pros
- ✅ Full control
- ✅ Works anywhere
- ✅ Easy scaling

### Cons
- ❌ Higher cost
- ❌ More complex

### Create Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -q -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.headless=true"]
```

### Deploy to Heroku
```bash
heroku login
heroku create incentive-dashboard
heroku stack:set container
git push heroku main
```

---

## Option 4: AWS (Full Enterprise Setup)

### Components
- **RDS**: PostgreSQL for production data
- **EC2**: App server
- **S3**: Report storage
- **CloudWatch**: Monitoring

### Benefits
- ✅ Unlimited scale
- ✅ Full control
- ✅ Enterprise features
- ✅ Highest performance

### Cost: ~$50-200/month

---

## Option 5: DigitalOcean App Platform

### Simple Steps
```bash
# Create app.yaml
name: incentive-dashboard
services:
- name: web
  github:
    repo: YOUR-USERNAME/incentive-dashboard
    branch: main
  source_dir: .
  http_port: 8501
  envs:
  - key: PYTHON_VERSION
    value: 3.9

# Deploy
doctl apps create --spec app.yaml
```

---

## 📊 Production Checklist

Before deploying to production:

### Security
- [ ] Remove debug mode: `DEBUG=False`
- [ ] Set strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Add authentication if needed

### Performance
- [ ] Test with expected data volume
- [ ] Set up caching
- [ ] Optimize queries
- [ ] Monitor performance metrics
- [ ] Set up alerts

### Database
- [ ] Backup strategy in place
- [ ] Database migrations planned
- [ ] Connection pooling configured
- [ ] Regular maintenance scheduled

### Monitoring
- [ ] Error logging configured
- [ ] Performance tracking enabled
- [ ] User analytics enabled
- [ ] Uptime monitoring active
- [ ] Alert channels configured

---

## 🔄 Continuous Deployment

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Dashboard

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Run tests
        run: python -m pytest
      
      - name: Deploy to Streamlit Cloud
        run: |
          streamlit deploy \
            --logger.level=debug \
            --client.showStderr=true
```

---

## 🗄️ Production Database Setup

### PostgreSQL (Recommended for Production)

#### 1. Create Database
```sql
CREATE DATABASE incentive_payouts;

CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    region VARCHAR(50) NOT NULL,
    expected_payout DECIMAL(10,2),
    payout_amount DECIMAL(10,2),
    payout_status VARCHAR(20),
    processing_time FLOAT,
    date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX idx_employee_id ON payouts(employee_id);
CREATE INDEX idx_region ON payouts(region);
CREATE INDEX idx_status ON payouts(payout_status);
CREATE INDEX idx_date ON payouts(date);
```

#### 2. Update Code
In `src/database.py`:
```python
import psycopg2

connection_string = os.getenv(
    'DATABASE_URL',
    'postgresql://user:password@localhost/incentive_payouts'
)
```

#### 3. Set Environment Variable
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/incentive_payouts"
```

---

## 📈 Scaling Considerations

### Current Setup (SQLite)
- Suitable for: Demos, development, < 100,000 records
- Limitations: Single-user, local file

### Need to Scale?
1. **PostgreSQL**: 100K - 10M records
2. **Data Warehouse**: 10M+ records (Snowflake, BigQuery)
3. **Real-time**: Add Kafka for streaming
4. **Caching**: Add Redis for performance

---

## 🔐 Security Best Practices

### Environment Variables
```bash
# Never commit secrets
DATABASE_PASSWORD=secret123
API_KEY=sk_live_xxx
```

### SQL Injection Prevention
```python
# Always use parameterized queries
cursor.execute("SELECT * FROM payouts WHERE id = ?", (employee_id,))

# Never use string concatenation
# Bad: f"SELECT * FROM payouts WHERE id = {id}"
# Good: "SELECT * FROM payouts WHERE id = ?"
```

### Data Protection
- [ ] Encrypt sensitive data in transit (HTTPS)
- [ ] Encrypt data at rest (database encryption)
- [ ] Use read-only database credentials for dashboards
- [ ] Implement role-based access control (RBAC)
- [ ] Audit log all data access

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor
1. **Uptime**: Should be > 99%
2. **Response Time**: Should be < 2 seconds
3. **Error Rate**: Should be < 0.1%
4. **Database Size**: Track growth
5. **Active Users**: Monitor usage

### Setup Monitoring
```python
# In app.py - add metrics
import time

start_time = time.time()
# ... dashboard logic ...
load_time = time.time() - start_time

st.write(f"Page load time: {load_time:.2f}s")
```

---

## 🚀 Deployment Comparison

| Platform | Cost | Setup Time | Scaling | Support |
|----------|------|-----------|---------|---------|
| Streamlit Cloud | Free | 5 min | Automatic | Good |
| Vercel | $20/mo | 10 min | Good | Great |
| Heroku | Free-$50 | 15 min | Manual | Good |
| AWS | $50-200 | 1 hour | Excellent | Great |
| DigitalOcean | $12-48 | 20 min | Good | Good |

---

## 📝 Post-Deployment

### 1. Verify Deployment
```bash
# Check if dashboard loads
curl https://your-dashboard-url.com

# Verify data connection
# - Login to dashboard
# - Click "Load Data from Database"
# - Check if metrics calculate
```

### 2. Set Up Backups
```bash
# Daily backup
0 2 * * * /usr/bin/sqlite3 /backup/incentive_payouts.db "VACUUM INTO '/backup/incentive_payouts_$(date +\%Y\%m\%d).db'"
```

### 3. Monitor Logs
```bash
# View deployment logs
streamlit logs
# or
heroku logs --tail
# or
aws logs tail /aws/lambda/incentive-dashboard --follow
```

### 4. Performance Testing
```bash
# Load test your dashboard
ab -n 100 -c 10 https://your-dashboard-url.com
```

---

## 🆘 Troubleshooting Deployment

### Issue: Database Connection Error
```
Solution: 
1. Check DATABASE_URL environment variable
2. Verify database credentials
3. Ensure database is running
4. Check cloud firewall rules
```

### Issue: Slow Dashboard
```
Solution:
1. Check query performance
2. Add database indexes
3. Reduce data range
4. Enable caching
5. Upgrade server
```

### Issue: Out of Memory
```
Solution:
1. Reduce data in memory
2. Paginate results
3. Archive old data
4. Increase server RAM
```

---

## 🎯 Next Steps

1. **Choose deployment platform** (Streamlit Cloud recommended)
2. **Push code to GitHub**
3. **Select region** for deployment
4. **Configure environment variables**
5. **Test dashboard** in production
6. **Set up monitoring** and alerts
7. **Share dashboard URL** with team

---

**Ready to deploy! Let's go live! 🚀**
