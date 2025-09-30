# Local Supabase Development Setup

This guide will help you set up local Supabase development with Docker for safe, fast development.

## Prerequisites

- Docker Desktop installed and running
- Supabase CLI installed globally: `npm install -g supabase`

## Setup Steps

### 1. Start Docker Desktop
Make sure Docker Desktop is running before proceeding.

### 2. Start Local Supabase Services

```bash
# Start all local Supabase services
supabase start
```

This will start:
- **PostgreSQL Database**: `localhost:54322`
- **Supabase API**: `localhost:54321`
- **Supabase Studio**: `localhost:54323`
- **Auth Server**: `localhost:54324`
- **Storage**: `localhost:54325`

### 3. Get Local Environment Variables

After `supabase start`, you'll see output like:

```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
JWT secret: your-jwt-secret
anon key: your-anon-key
service_role key: your-service-role-key
```

### 4. Create Local Environment File

Create `.env.local` in your project root:

```bash
# .env.local (for local development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-start
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: for testing
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 5. Apply Database Migrations

Your migrations should automatically apply when starting Supabase, but you can manually run:

```bash
# Apply all migrations to local database
supabase db reset
```

### 6. Start Your Next.js App

```bash
# Start local development server
npm run dev
```

Your app will now connect to the local Supabase instance.

## Development Workflow

### Daily Development
```bash
# 1. Start Docker Desktop
# 2. Start Supabase
supabase start

# 3. Start your app
npm run dev

# 4. Develop and test locally at http://localhost:3000
```

### Making Database Changes
```bash
# Create a new migration
supabase migration new your_migration_name

# Edit the migration file in supabase/migrations/
# Apply the migration locally
supabase db reset

# Test your changes locally
```

### Deploying to Production
```bash
# Push database changes to production
supabase db push

# Deploy your code (automatic via GitHub)
git push origin main
```

## Useful Commands

### Database Management
```bash
# View database status
supabase status

# Stop all services
supabase stop

# Reset database (apply all migrations fresh)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

### Accessing Services

- **Local App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323 (database admin)
- **Email Testing**: http://localhost:54324 (Inbucket for auth emails)

## Troubleshooting

### Docker Issues
```bash
# If Docker is not running
# Start Docker Desktop application first

# Check Docker status
docker --version
docker ps
```

### Supabase Issues
```bash
# View detailed logs
supabase status --debug

# Restart services
supabase stop
supabase start
```

### Port Conflicts
If ports are already in use, you can configure different ports in `supabase/config.toml`.

## Benefits of Local Development

✅ **Safe Testing**: No risk to production data
✅ **Fast Iteration**: No network latency
✅ **Offline Development**: Works without internet
✅ **Migration Testing**: Safely test database changes
✅ **Real-time Development**: Instant feedback on changes

## Switching Between Local and Production

### For Local Development
Use `.env.local` with local Supabase URLs

### For Production Testing
Use `.env` with production Supabase URLs (current setup)

### For Vercel Deployment
Environment variables are set in Vercel dashboard (already configured)

## Current Status

Your app is currently configured to work with production Supabase. Once you set up local development:

1. **Continue using production** for immediate testing of current features
2. **Switch to local development** for new feature development
3. **Use both**: local for development, production for final testing

The girl creation fix has been deployed to production and should work on your live site.