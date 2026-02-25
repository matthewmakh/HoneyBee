# Honeybee Referral Club

A production-ready, multi-tenant referral marketplace connecting referrers with service providers. Built with Next.js 16, TypeScript strict mode, TailwindCSS, shadcn/ui, Prisma ORM, and PostgreSQL.

## Features

### For Referrers
- Browse verified provider directory
- Submit leads with client information
- Track lead status through completion
- View cash and benefits wallet balances
- Commission snapshot locks rate at submission time

### For Providers
- Receive and review incoming leads
- Accept or reject leads with notes
- Mark jobs as completed
- Configure commission rates (flat fee or percentage)
- Manage service areas and categories

### For Super Admins
- Platform-wide analytics dashboard
- Confirm completed jobs and process payments
- Manage companies (suspend/activate/delete)
- Full visibility into all leads and transactions

## Commission Structure

The platform uses a **50/40/10 split**:
- **50%** → Referrer Cash Balance
- **40%** → Referrer Benefits Balance
- **10%** → Platform Profit

Commission is **snapshotted at lead submission time**, ensuring referrers receive the rate active when they submitted the lead, regardless of later changes.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth v5)
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd honeybee-referral-club
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and generate an AUTH_SECRET:
```bash
openssl rand -base64 32
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed with sample data:
```bash
npx tsx prisma/seed.ts
```

6. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Test Accounts (after seeding)

All accounts use password: `password123`

| Role | Email |
|------|-------|
| Super Admin | admin@honeybee.com |
| Referrer | john@goldenreferrals.com |
| Referrer | jane@goldenreferrals.com |
| Provider | mike@coolair.com |
| Provider | sarah@fastflow.com |
| Provider | tom@brightspark.com |

## Project Structure

```
src/
├── app/
│   ├── admin/           # Super Admin portal
│   │   ├── companies/   # Company management
│   │   └── pending/     # Pending deal confirmations
│   ├── dashboard/
│   │   ├── referrer/    # Referrer portal
│   │   └── provider/    # Provider portal
│   ├── login/           # Authentication
│   ├── register/        # Registration
│   └── suspended/       # Suspended account page
├── components/
│   └── ui/              # shadcn/ui components
└── lib/
    ├── services/        # Business logic layer
    │   ├── companies.ts
    │   ├── finance.ts   # Commission calculations
    │   ├── leads.ts
    │   └── providers.ts
    ├── auth.ts          # Auth.js configuration
    ├── db.ts            # Prisma client
    ├── types.ts         # TypeScript types
    ├── utils.ts         # Utility functions
    └── validations.ts   # Zod schemas
```

## Database Schema

### Core Models

- **Company**: Multi-tenant container (REFERRER or PROVIDER type)
- **User**: Accounts with role-based access (SUPERADMIN, REFERRER, PROVIDER)
- **ProviderProfile**: Provider service configuration and commission rates
- **Lead**: Referral records with status tracking and financial snapshots
- **WalletTransaction**: Immutable ledger for all financial movements

### Lead Lifecycle

```
PENDING → ACCEPTED → JOB_COMPLETED → PAID
            ↓
         REJECTED
```

## API Patterns

All mutations use Next.js Server Actions with consistent response types:

```typescript
type ApiResult<T> =
  | { success: true; data?: T }
  | { success: false; error: string };
```

## Security

- All financial logic runs server-side
- Commission values are snapshotted and immutable
- Role-based middleware protects all routes
- Suspended companies cannot access the platform
- Company deletion blocked if financial history exists

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

### Database Studio
```bash
npx prisma studio
```

## Deployment

1. Set production environment variables
2. Run database migrations:
```bash
npx prisma migrate deploy
```
3. Build and start:
```bash
npm run build
npm start
```

## License

MIT
