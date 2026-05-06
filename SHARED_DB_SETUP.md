# Shared Database Integration Guide

## Overview

This Incentive Operations Dashboard has been configured to connect to a **shared PostgreSQL database (Neon)** using **Prisma ORM**. This ensures all services in the distributed system work with the same data models and database.

## Database Configuration

### Environment Setup

The application uses the `DATABASE_URL` environment variable to connect to Neon:

```bash
# .env file
DATABASE_URL="postgresql://neondb_owner:npg_WlotnR7q0gFs@ep-lively-brook-an5s2vtj-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Security Note**: Never commit the `.env` file with real credentials to version control. Use `.env.example` for the template and configure `DATABASE_URL` in your deployment environment (Vercel, Docker, etc.).

## Shared Database Schema

The Neon database contains three core tables representing the shared data model:

### 1. Employee Table

Stores employee master data used across all services.

```prisma
model Employee {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  region        String    // US, EMEA, APAC
  department    String    // Sales, Operations, Finance
  role          String    // Sales Manager, Analyst, etc.
  hireDate      DateTime
  status        String    @default("active") // active, inactive, on_leave
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  incentives    Incentive[]
  performance   Performance[]
}
```

**Sample Employees:**
- Alice Johnson (Sales, US)
- Bob Smith (Operations, EMEA)
- Carol Davis (Finance, APAC)
- David Chen (Sales, US)
- Emma Wilson (Operations, EMEA)

### 2. Incentive Table

Tracks incentive payouts with accuracy validation and error detection.

```prisma
model Incentive {
  id               String   @id @default(cuid())
  employeeId       String
  
  // Payout amounts
  expectedAmount   Float    // Target payout
  actualAmount     Float    // Processed payout
  variance         Float?   // Calculated: actualAmount - expectedAmount
  variancePercent  Float?   // Percentage difference
  
  // Processing
  processingTimeMs Int?     // Time to process (milliseconds)
  status           String   @default("processed") // pending, processed, failed
  period           String   // "2026-05", "2026-Q1"
  
  // Error tracking
  hasError         Boolean  @default(false)
  errorType        String?  // "data_issue", "logic_issue", "delay_issue"
  errorDescription String?
  errorSeverity    String?  // "critical", "high", "medium", "low"
  
  // Timestamps
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

**Key Features:**
- Automatic variance calculation (expected vs actual)
- Error flagging with classification
- Processing time tracking
- Period-based grouping for reporting

### 3. Performance Table

Tracks employee performance metrics updated periodically.

```prisma
model Performance {
  id            String   @id @default(cuid())
  employeeId    String
  metricsDate   DateTime
  
  // Processing metrics
  payoutsProcessed    Int     // Count of incentives processed
  errorCount          Int     // Number of errors detected
  avgProcessingTimeMs Float   // Average processing time
  slaCompliance       Float   // SLA compliance percentage (0-100)
  
  // Quality metrics
  accuracyRate        Float   // Accuracy percentage
  delayRate           Float   // Percentage of delayed items
  
  status              String  @default("active")
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  employee            Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@index([metricsDate])
}
```

## API Routes with Shared Database

All API routes now query the shared database:

### GET /api/kpis

Returns KPI metrics from the shared database:

```bash
curl http://localhost:3000/api/kpis
```

**Response:**
```json
{
  "totalIncentivesProcessed": 10,
  "errorRate": 20.0,
  "avgProcessingTimeMs": 3450.5,
  "pendingIncentives": 0,
  "slaCompliance": 96.5,
  "avgAccuracy": 98.2
}
```

### GET /api/payouts?limit=50

Fetches incentive records with employee details:

```bash
curl "http://localhost:3000/api/payouts?limit=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": "cuid...",
      "employeeId": "emp123",
      "employeeName": "Alice Johnson",
      "region": "US",
      "expectedAmount": 5000,
      "actualAmount": 5000,
      "variance": null,
      "variancePercent": null,
      "processingTimeMs": 2100,
      "status": "processed",
      "period": "2026-05"
    }
  ]
}
```

### GET /api/errors?errorType=&region=

Fetches error records with filtering:

```bash
curl "http://localhost:3000/api/errors?errorType=data_issue&region=US"
```

**Response:**
```json
{
  "data": [
    {
      "id": "cuid...",
      "employeeId": "emp456",
      "employeeName": "Bob Smith",
      "region": "EMEA",
      "type": "data_issue",
      "severity": "high",
      "description": "Missing employee classification",
      "period": "2026-05"
    }
  ]
}
```

### POST /api/validate-payouts

Validates recent incentives and returns mismatches:

```bash
curl -X POST http://localhost:3000/api/validate-payouts
```

**Response:**
```json
{
  "results": [
    {
      "id": "cuid...",
      "employeeName": "Carol Davis",
      "region": "APAC",
      "expectedAmount": 4500,
      "actualAmount": 4100,
      "variance": -400,
      "variancePercent": 8.89,
      "hasMismatch": true,
      "hasDelay": false
    }
  ],
  "count": 5
}
```

## Services for Business Logic

### Validation Service (`src/services/validation.ts`)

**`validateIncentives()`** - Compares expected vs actual payouts:

```typescript
const results = await validateIncentives();
// Returns array of incentives with:
// - variance calculations
// - mismatch flags (> $0.01)
// - delay flags (> 5 seconds)
```

### Error Detection Service (`src/services/errorDetection.ts`)

**`classifyErrors(limit=100)`** - Classifies error records:

```typescript
const errors = await classifyErrors();
// Classifies into:
// - Data issue (missing/invalid data)
// - Logic issue (calculation errors)
// - Delay issue (timeout/processing delays)
```

**`detectAnomalies()`** - Finds unusual patterns:

```typescript
const anomalies = await detectAnomalies();
// Returns items with variance > 5%
```

## Setup Instructions

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to Neon database
npx prisma db push

# Seed database with sample data
npm run seed
```

### 2. Development

```bash
# Start dev server
npm run dev
# Server runs on http://localhost:3000
```

The dashboard will read/write data to the shared Neon database.

### 3. Production Deployment

On Vercel or any production platform:

1. Set `DATABASE_URL` environment variable
2. Run migrations: `npx prisma migrate deploy`
3. Deploy the application

```bash
git push origin main
# Vercel deploys automatically
# DATABASE_URL is configured in Vercel dashboard
```

## Database Operations

### Common Queries

**Get all employees:**
```typescript
const employees = await prisma.employee.findMany();
```

**Get incentives for an employee:**
```typescript
const incentives = await prisma.incentive.findMany({
  where: { employeeId: "emp123" },
  include: { employee: true }
});
```

**Get errors by type:**
```typescript
const errors = await prisma.incentive.findMany({
  where: { 
    hasError: true,
    errorType: "data_issue"
  }
});
```

**Get performance metrics:**
```typescript
const perf = await prisma.performance.findMany({
  where: { metricsDate: { gte: new Date("2026-05-01") } }
});
```

### Updating Records

**Mark incentive as processed:**
```typescript
await prisma.incentive.update({
  where: { id: "incentive123" },
  data: { status: "processed" }
});
```

**Flag an error:**
```typescript
await prisma.incentive.update({
  where: { id: "incentive123" },
  data: {
    hasError: true,
    errorType: "data_issue",
    errorDescription: "Missing employee code",
    errorSeverity: "high"
  }
});
```

## Shared System Architecture

```
┌─────────────────────────────────────────────────────┐
│          Neon PostgreSQL Database (shared)          │
│  ┌──────────────┬──────────────┬─────────────────┐  │
│  │   Employee   │  Incentive   │   Performance   │  │
│  └──────────────┴──────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────┘
           ↑                    ↑                    ↑
           │                    │                    │
   ┌───────┴────────┐  ┌────────┴────────┐  ┌──────┴──────────┐
   │                │  │                 │  │                 │
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐
│   IOM Dash   │  │  Payroll Svc │  │  HR Analytics Service    │
│  (this app)  │  │              │  │                          │
└──────────────┘  └──────────────┘  └──────────────────────────┘
```

All services read/write to the same shared database, ensuring data consistency across the distributed system.

## Monitoring the Shared Database

### Check Database Health

```bash
# List all tables
npx prisma db execute --stdin < query.sql

# View Prisma Studio (web UI)
npx prisma studio
```

### Verify Data Sync

```bash
# Count records in each table
curl http://localhost:3000/api/kpis  # Verify counts
curl http://localhost:3000/api/payouts?limit=1  # Check latest record
curl http://localhost:3000/api/errors?limit=1  # Check latest error
```

## Troubleshooting

### Connection Issues

**Error: "could not connect to server"**
- Verify `DATABASE_URL` in `.env`
- Check Neon IP allowlist settings
- Ensure SSL mode is enabled

### Schema Mismatch

**Error: "table does not exist"**
```bash
# Regenerate schema
npx prisma db push
npx prisma generate
```

### Migration Issues

**Error: "migration already exists"**
```bash
# Reset and re-migrate (development only!)
npx prisma migrate reset
npm run seed
```

## Best Practices

1. **Never modify the schema without coordination** - Document changes and sync across all services
2. **Use database indexes** - Incentive queries are indexed on employeeId, status, period
3. **Keep transactions short** - Minimize lock contention in shared database
4. **Monitor query performance** - Use Neon's built-in monitoring
5. **Backup regularly** - Neon provides automated backups
6. **Use connection pooling** - Neon's connection pooler is enabled

## Performance Optimization

The schema includes indexes for common queries:

```prisma
@@index([employeeId])      // Fast employee lookups
@@index([status])          // Fast status filtering
@@index([period])          // Period-based queries
@@index([hasError])        // Error reporting
@@index([metricsDate])     // Time-range queries
```

This ensures:
- ✅ Fast dashboard loads
- ✅ Efficient error filtering
- ✅ Quick performance reports
- ✅ Scalable to millions of records

---

**Version**: 1.0.0  
**Last Updated**: May 6, 2026  
**Database**: PostgreSQL (Neon)  
**ORM**: Prisma v6.13
