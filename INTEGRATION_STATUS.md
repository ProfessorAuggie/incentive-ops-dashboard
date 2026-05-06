# Shared Database Integration Checklist

## ✅ Configuration Complete

### Database Setup
- ✅ Neon PostgreSQL database configured
- ✅ Prisma ORM (v6.13) integrated
- ✅ DATABASE_URL environment variable configured
- ✅ Shared schema deployed (Employee, Incentive, Performance tables)
- ✅ Sample data seeded (5 employees, 10 incentives, 5 performance records)

### Application Ready
- ✅ All API routes updated to use shared database
- ✅ Validation service reads from shared Incentive table
- ✅ Error detection service classifies errors from shared data
- ✅ Dashboard displays live data from shared database
- ✅ TypeScript compilation successful
- ✅ Production build passes (Next.js optimized)

## 📋 Quick Start

### 1. Local Development

```bash
# Install dependencies
npm install

# Verify Prisma generated
npx prisma generate

# Start dev server
npm run dev
# Open http://localhost:3000
```

### 2. Database Operations

```bash
# View database schema in web UI
npx prisma studio

# Seed additional data
npm run seed

# Reset database (development only)
npx prisma migrate reset
```

### 3. Production Deployment

```bash
# Push schema to production database
npx prisma db push

# Deploy to Vercel
git push origin main

# Set DATABASE_URL in Vercel dashboard environment variables
```

## 📊 Data Access Examples

### Query Incentives with Employee Info

```typescript
// From any API route or service
const incentives = await prisma.incentive.findMany({
  where: { period: "2026-05" },
  include: { employee: true },
  take: 50,
});
```

### Filter Errors by Type and Region

```typescript
const errors = await prisma.incentive.findMany({
  where: {
    hasError: true,
    errorType: "data_issue",
    employee: { region: "US" }
  },
  include: { employee: true }
});
```

### Get Performance Metrics

```typescript
const perf = await prisma.performance.aggregate({
  _avg: { slaCompliance: true, accuracyRate: true }
});
```

## 🔗 API Endpoints

**All endpoints query the shared database:**

- `GET /api/kpis` - KPI metrics from Incentive + Performance tables
- `GET /api/payouts?limit=50` - Incentive records with Employee details
- `GET /api/errors?errorType=data_issue&region=US` - Error filtering
- `POST /api/validate-payouts` - Real-time validation against expected/actual

## 📚 Documentation

- [README.md](README.md) - Main documentation
- [SHARED_DB_SETUP.md](SHARED_DB_SETUP.md) - Complete database integration guide
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema definition

## 🚀 Next Steps

1. **Test with your services:**
   - Other microservices can connect to same `DATABASE_URL`
   - All will read/write shared Employee, Incentive, Performance tables

2. **Add data:**
   - Use Prisma Client in your services to create/update records
   - Dashboard automatically reflects changes

3. **Monitor performance:**
   - Neon dashboard shows query metrics
   - Prisma indexes (on employeeId, status, period, hasError) ensure fast queries

4. **Scale up:**
   - Add migrations for schema changes: `npx prisma migrate dev --name my_change`
   - Coordinate schema updates across all services
   - Use Neon backups for production safety

## ⚠️ Important Notes

- **Never commit `.env`** - Keep DATABASE_URL secret
- **Use `.env.example`** as template for team members
- **Production:** Set DATABASE_URL in deployment platform (Vercel, Docker, etc.)
- **Shared DB:** Coordinate schema changes with other services
- **Performance:** Indexes are configured for common queries

## 🆘 Troubleshooting

**"Table does not exist"**
```bash
npx prisma db push
npx prisma generate
```

**Connection error**
- Verify `DATABASE_URL` in `.env`
- Check Neon IP allowlist
- Ensure SSL is enabled

**Type errors in TypeScript**
```bash
npx prisma generate
npm run build
```

---

**Status**: ✅ Production-Ready  
**Database**: PostgreSQL (Neon)  
**Last Updated**: May 6, 2026
