# Incentive Operations Monitoring Dashboard

A production-grade web application for monitoring incentive operations from a **shared PostgreSQL database**, detecting errors, and ensuring accuracy and efficiency in payout processing across a distributed system.

## Overview

The **Incentive Operations Monitoring Dashboard (IOM)** is an enterprise-grade system designed to:

- **Monitor Incentives**: Track employee incentive payouts with real-time KPIs from shared database
- **Detect Errors**: Classify and log errors with severity levels and detailed descriptions
- **Ensure Accuracy**: Compare expected vs actual payouts and flag mismatches automatically
- **Track Performance**: Analyze regional performance metrics and SLA compliance
- **Provide Insights**: Visualize trends and drill into specific transactions
- **Share Data**: Integrate with other services via a common PostgreSQL database

## Architecture

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Database**: PostgreSQL on Neon (shared across microservices)
- **ORM**: Prisma v6.13 (environment-based configuration)
- **Charts**: Recharts 3.8
- **Themes**: next-themes for dark/light mode support
- **Deployment**: Vercel (production-ready)

### Data Models (Shared)

This application reads/writes to three shared database tables:

1. **Employee** - Employee master data (name, email, region, department, role)
2. **Incentive** - Incentive/payout records with variance tracking and error detection
3. **Performance** - Employee performance metrics (SLA, accuracy, processing times)

See [SHARED_DB_SETUP.md](SHARED_DB_SETUP.md) for complete database documentation.

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── kpis/              GET - Fetch KPI metrics from shared DB
│   │   ├── payouts/           GET - Fetch incentive records from shared DB
│   │   ├── errors/            GET - Fetch error logs with filters
│   │   └── validate-payouts/  POST - Validate payouts via shared DB
│   ├── components/
│   │   ├── Navbar.tsx         Top navigation bar
│   │   ├── Sidebar.tsx        Side navigation menu
│   │   ├── ThemeToggle.tsx    Dark/light mode toggle
│   │   └── KpiCard.tsx        Reusable KPI metric card
│   ├── dashboard/             Operations Dashboard page
│   ├── errors/                Error Monitoring page
│   ├── performance/           Performance & SLA page
│   ├── layout.tsx             Root layout with theme provider
│   └── page.tsx               Home/landing page
├── lib/
│   └── prisma.ts              Prisma client (uses DATABASE_URL env var)
└── services/
    ├── validation.ts          Payout validation against shared data
    └── errorDetection.ts      Error classification service
prisma/
├── schema.prisma              Database schema (Employee, Incentive, Performance)
└── seed.ts                    Seed script for sample data
```
prisma/
└── schema.prisma              Database schema
```

## Features

### 1. Operations Dashboard (`/dashboard`)

**KPI Cards:**
- **Total Payouts Processed**: Count of all processed payouts
- **Error Rate (%)**: Percentage of errors relative to total payouts
- **Avg Processing Time**: Average time to process a payout (ms)
- **Pending Payouts**: Count of payouts still in progress

**Charts:**
- **Region vs Payouts**: Bar chart showing payout distribution by region
- **Processing Time Trend**: Line chart showing processing time over time

**Recent Payouts Table:**
- Employee name, region, expected/actual amounts
- Processing time, status

**Drill-down**: Click any row to see detailed breakdown

### 2. Error Monitoring (`/errors`)

**Features:**
- **Error Table**: Lists all logged errors with details
- **Filters**:
  - By error type (Data issue, Logic issue, Delay issue)
  - By region (US, EMEA, APAC)
- **Severity Highlighting**: Critical errors highlighted in red
- **Classification**: Errors automatically classified based on description

**Error Attributes:**
- Employee, Region
- Type (Data issue, Logic issue, Delay issue)
- Description
- Severity (critical, high, medium, low)

### 3. Performance & SLA Page (`/performance`)

**SLA Tracking:**
- Regional SLA compliance percentages
- On-time delivery rates
- Processing delays by region

**Charts:**
- **SLA Performance by Region**: Stacked bar chart (on-time vs delayed)
- **Processing Time Trend (24h)**: Line chart of hourly averages

**Regional Summary:**
- SLA compliance, average processing time, total payouts per region

### 4. Drill-down Detail View (`/dashboard/[id]`)

**Payout Details:**
- Employee info, region, status, timestamp
- Expected vs actual amounts
- Variance analysis with percentage
- Processing time metrics

**Related Errors:**
- Lists errors associated with the payout
- Shows error type, description, and severity

## Shared Database Schema

This application connects to a shared PostgreSQL database (Neon) with three core tables for distributed system integration.

### Employee Model

Master employee data across all services:

```prisma
model Employee {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  region        String   // US, EMEA, APAC
  department    String
  role          String
  hireDate      DateTime
  status        String   @default("active")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  incentives    Incentive[]
  performance   Performance[]
}
```

### Incentive Model

Tracks incentive payouts with automatic error detection, sales context, and variance calculation:

```prisma
model Incentive {
  id               String   @id @default(cuid())
  employeeId       String
  salesAmount      Float    @default(0)
  salesTarget      Float    @default(0)
  expectedAmount   Float
  actualAmount     Float
  variance         Float?   // Calculated: actualAmount - expectedAmount
  variancePercent  Float?
  processingTimeMs Int?
  status           String   @default("processed")
  period           String   // "2026-05", "2026-Q1"
  
  hasError         Boolean  @default(false)
  errorType        String?  // data_issue, logic_issue, delay_issue, incorrect_payout, suspicious_value
  errorDescription String?
  errorSeverity    String?  // critical, high, medium, low
  isIncorrectPayout Boolean  @default(false)
  isSuspiciousValue Boolean  @default(false)
  
  processedAt      DateTime @default(now())
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  employee         Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@index([status])
  @@index([period])
  @@index([hasError])
}
```

### Performance Model

Aggregated performance metrics for employee tracking:

```prisma
model Performance {
  id                  String   @id @default(cuid())
  employeeId          String
  metricsDate         DateTime
  payoutsProcessed    Int
  errorCount          Int
  avgProcessingTimeMs Float
  slaCompliance       Float
  accuracyRate        Float
  delayRate           Float
  status              String   @default("active")
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  employee            Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@index([metricsDate])
}
```

**See [SHARED_DB_SETUP.md](SHARED_DB_SETUP.md) for complete database documentation and multi-service architecture details.**

## API Endpoints

### `GET /api/kpis`

Returns KPI metrics queried from shared database.

**Response:**
```json
{
  "totalIncentivesProcessed": 10,
  "averageIncentive": 4125.5,
  "errorRate": 20.0,
  "anomalyCount": 2,
  "errorBreakdown": {
    "dataIssues": 1,
    "logicIssues": 1,
    "delayIssues": 1,
    "incorrectPayouts": 1,
    "suspiciousValues": 1
  },
  "avgProcessingTimeMs": 3450.5,
  "pendingIncentives": 0,
  "slaCompliance": 96.5,
  "avgAccuracy": 98.2,
  "avgVariancePercent": 4.2
}
```

### `GET /api/payouts?limit=50`

Fetches paginated payouts data (default: 50 items).

**Response:**
```json
{
  "data": [
    {
      "id": "cuid...",
      "employee": "John Doe",
      "region": "US",
      "expected_amount": 5000,
      "actual_amount": 5000,
      "status": "processed",
      "processing_time": 2100,
      "processed_at": "2026-05-06T10:30:00Z"
    }
  ]
}
```

### `GET /api/errors?errorType=&region=`

Fetches filtered error logs (supports optional `errorType` and `region` query params).

**Response:**
```json
{
  "data": [
    {
      "id": "cuid...",
      "employee": "Jane Smith",
      "region": "EMEA",
      "type": "incorrect_payout",
      "severity": "critical",
      "description": "Zero payout despite achieving sales target",
      "salesAmount": 16000,
      "salesTarget": 12000,
      "createdAt": "2026-05-06T09:15:00Z"
    }
  ]
}
```

### `POST /api/validate-payouts`

Validates all recent payouts and returns mismatches and delays.

**Response:**
```json
{
  "results": [
    {
      "id": "cuid...",
      "employee": "John Doe",
      "region": "US",
      "expected": 5000,
      "actual": 4950,
      "mismatch": true,
      "delay": false
    }
  ]
}
```

## Business Logic

### Payout Validation

- **Mismatch Detection**: Flags payouts where `|expected - actual| > $0.01`
- **Delay Detection**: Flags payouts with `processing_time > 5000ms`
- **Comparison Service**: `src/services/validation.ts`

### Error Classification

Errors are automatically classified into five categories:

1. **Data Issue**: Missing/invalid data fields
2. **Logic Issue**: Calculation or business logic errors
3. **Delay Issue**: Timeout or processing delays
4. **Incorrect Payout**: Payout is zero while sales exceed target
5. **Suspicious Value**: Payout is unusually high relative to sales

**Classification Service**: `src/services/errorDetection.ts`

### Monitoring Rules

- Flag payouts where `actualAmount = 0` and `salesAmount > salesTarget`
- Flag payouts where `actualAmount / salesAmount > 0.5`
- Re-query the shared database on every page load and API request

### KPI Calculation

- **Error Rate**: `(total_errors / total_payouts) * 100`
- **Avg Processing Time**: Average of all `processing_time` values
- **Pending Payouts**: Count where `status = 'pending'`

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Git

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd incentive-ops-dashboard
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your DATABASE_URL from Neon
   ```

   Example Neon connection string:
   ```
   DATABASE_URL="postgresql://neondb_owner:password@ep-xxxx-pooler.neon.tech/neondb?sslmode=require"
   ```

3. **Initialize database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed  # (optional: add sample data)
   ```

4. **Run dev server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Production Deployment (Vercel)

1. **Push to GitHub** (Vercel requires a GitHub repo)

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Set environment variable: `DATABASE_URL`
   - Deploy

3. **Run migrations on Vercel:**
   ```bash
   # Add to `postinstall` in package.json if not present
   npx prisma migrate deploy
   ```

## Dark/Light Mode

The dashboard includes built-in theme toggle:
- Uses `next-themes` for persistent theme preference
- Toggle button in top navbar
- Tailwind `dark:` classes for dark mode styling
- Respects system preference on first visit

## UI/UX Design System

### Color Palette

- **Primary**: Indigo-500 (#4f46e5)
- **Success**: Green-600 (#16a34a)
- **Error**: Red-600 (#dc2626)
- **Cyan**: Cyan-500 (#06b6d4)
- **Neutral**: Zinc scale (50-950)

### Components

- **KPI Cards**: Gradient background, subtle shadow
- **Charts**: Recharts with tooltips and responsive sizing
- **Tables**: Clean, borderless with hover states
- **Filters**: Styled dropdowns with smooth interaction
- **Sidebar**: Fixed navigation with gradient and active states

### Typography

- **Headings**: Geist Sans (font-geist-sans)
- **Body**: Geist Sans
- **Monospace**: Geist Mono (for code/values)

## Monitoring & Analytics

### Real-time Updates

- Refresh data on page load using live API calls
- Charts are derived from the latest payout records
- KPI metrics are fetched fresh from the shared database on every visit

### Error Detection

- Errors are detected from shared incentive records and validation rules
- Incorrect payouts and suspicious values are flagged automatically
- SLA violations and processing delays remain tracked

### Dashboard Views

- KPI cards for total payouts, average incentive, anomaly count, and error rate
- Region vs payout chart computed from live incentive data
- Flagged error table with severity, sales context, and descriptions

### Extensibility

To add new metrics or dashboards:

1. Create API route in `src/app/api/`
2. Add Prisma queries as needed
3. Create page component in `src/app/`
4. Add navigation link in `Sidebar.tsx`

## Known Limitations & Future Enhancements

### Current

- Region chart is aggregated client-side from fetched incentive records
- Error filters are intentionally lightweight for monitoring usage
- Large histories may require pagination or server-side aggregation

### Future Enhancements

- [ ] Export error logs to CSV/PDF
- [ ] Advanced filtering and search
- [ ] Scheduled reports and email notifications
- [ ] Webhooks for external integrations
- [ ] Historical data archival
- [ ] Real-time WebSocket updates
- [ ] User authentication and role-based access
- [ ] Anomaly detection (ML-powered)
- [ ] SLA alerts and notifications

## Performance Considerations

- **Database Indexing**: Add indexes on `employee`, `region`, `type` fields
- **Pagination**: Use `take` parameter in API routes for large datasets
- **Caching**: Consider Next.js ISR for less-frequently-updated pages
- **Monitoring**: Enable Vercel Analytics for production insights

## Troubleshooting

### "prisma" not found

```bash
npm install @prisma/client prisma
```

### Database connection error

- Verify `DATABASE_URL` in `.env`
- Check Neon IP allowlist settings
- Ensure SSL mode is enabled for Neon

### Theme not persisting

- Check browser localStorage settings
- Ensure `html` element has `lang="en"` (required for next-themes)

## Contributing

This is a production-grade application. When making changes:

1. **Test locally** before pushing
2. **Run migrations** safely with backups
3. **Test dark/light modes** for all new components
4. **Validate API responses** match expected schema
5. **Check mobile responsiveness**

## License

Internal use only. Built for Incentive Operations team.

## Support

For issues or feature requests, contact the development team.

---

**Last Updated**: May 6, 2026  
**Version**: 1.0.0  
**Status**: Production-Ready
