# Incentive Operations Monitoring Dashboard

A production-grade web application for monitoring incentive operations, detecting errors, and ensuring accuracy and efficiency in payout processing.

## Overview

The **Incentive Operations Monitoring Dashboard (IOM)** is an enterprise-grade system designed to:

- **Monitor Payouts**: Track all processed payouts with KPIs and real-time metrics
- **Detect Errors**: Classify and log errors with severity levels and detailed descriptions
- **Ensure Accuracy**: Compare expected vs actual payouts and flag mismatches
- **Track Performance**: Analyze regional performance and SLA compliance
- **Provide Insights**: Visualize trends and drill into specific transactions

## Architecture

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 7.8
- **Charts**: Recharts 3.8
- **Themes**: next-themes for dark/light mode support
- **Deployment**: Vercel

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── kpis/              GET - Fetch KPI metrics
│   │   ├── payouts/           GET - Fetch payouts data
│   │   ├── errors/            GET - Fetch error logs with filters
│   │   └── validate-payouts/  POST - Validate and compare payouts
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
│   └── prisma.ts              Prisma client utility
└── services/
    ├── validation.ts          Payout validation logic
    └── errorDetection.ts      Error classification service
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

## Database Schema

### Payout Model

```prisma
model Payout {
  id               String   @id @default(cuid())
  employee         String
  region           String
  expected_amount  Float
  actual_amount    Float
  status           String   @default("processed")
  processing_time  Int?     // milliseconds
  processed_at     DateTime @default(now())
  errors           ErrorLog[]
}
```

### ErrorLog Model

```prisma
model ErrorLog {
  id          String   @id @default(cuid())
  payoutId    String?
  employee    String
  region      String
  type        String
  severity    String   @default("medium")
  description String
  createdAt   DateTime @default(now())
  payout      Payout?  @relation(fields: [payoutId], references: [id])
}
```

## API Endpoints

### `GET /api/kpis`

Returns current KPI metrics.

**Response:**
```json
{
  "totalPayouts": 12432,
  "errorRate": 1.23,
  "avgProcessingTimeMs": 2130,
  "pendingPayouts": 42
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

### `GET /api/errors?type=&region=`

Fetches filtered error logs (supports optional `type` and `region` query params).

**Response:**
```json
{
  "data": [
    {
      "id": "cuid...",
      "employee": "Jane Smith",
      "region": "EMEA",
      "type": "Data issue",
      "severity": "high",
      "description": "Missing employee ID in request",
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

Errors are automatically classified into three categories:

1. **Data Issue**: Missing/invalid data fields
2. **Logic Issue**: Calculation or business logic errors
3. **Delay Issue**: Timeout or processing delays

**Classification Service**: `src/services/errorDetection.ts`

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

- Refresh data on page load
- Charts update automatically with latest data
- KPI metrics fetch fresh data on each page visit

### Error Detection

- Errors logged on payout mismatch detection
- SLA violations tracked
- Processing delays flagged automatically

### Extensibility

To add new metrics or dashboards:

1. Create API route in `src/app/api/`
2. Add Prisma queries as needed
3. Create page component in `src/app/`
4. Add navigation link in `Sidebar.tsx`

## Known Limitations & Future Enhancements

### Current

- Sample data generation for testing (no seed script included)
- Basic filtering (type, region only)
- Static regional definitions

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
