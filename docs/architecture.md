# CPN App Fullstack Architecture Document

**Version:** 2.0
**Date:** September 28, 2024
**Status:** Final
**Project:** CPN App - Database-First Rebuild

---

## Introduction

This document outlines the complete fullstack architecture for CPN App, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

**Status:** Brownfield project with existing Next.js codebase
**Existing Assets:** Complete UI/UX in local storage, 40 validated features, Next.js app structure
**Constraints:** Must preserve existing app/ folder structure and UI components exactly
**Migration Goal:** Database-first rebuild to prevent previous Supabase integration failure

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2024-09-28 | 2.0 | Complete fullstack architecture for Supabase migration | Winston (Architect) |

---

## High Level Architecture

### Technical Summary

The CPN app employs a **Jamstack architecture with real-time backend services**, combining Next.js 14+ frontend with Supabase backend for instant scalability. The architecture prioritizes **database-first design** to prevent previous migration failures, implementing Supabase Real-time subscriptions for immediate UI updates across add data flows. **Multi-tenant Row Level Security (RLS)** ensures complete data isolation, while anonymous onboarding sessions enable seamless data persistence through payment flows. The system deploys via **Vercel + Supabase** for optimal developer experience and automatic scaling to support thousands of concurrent users across freemium subscription tiers.

### Platform and Infrastructure Choice

**Platform:** Vercel + Supabase
**Key Services:** Next.js 14, Supabase PostgreSQL, Supabase Auth, Supabase Real-time, Stripe integration
**Deployment Host and Regions:** Vercel Edge (global), Supabase US East (primary)

### Repository Structure

**Structure:** Monorepo with app/packages organization
**Monorepo Tool:** Turborepo (optimal for Vercel deployment)
**Package Organization:** Separate shared types, preserve existing app structure, add database utilities

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "User Layer"
        U1[Mobile Users]
        U2[Desktop Users]
        U3[Anonymous Users]
    end

    subgraph "CDN & Edge"
        CF[Vercel Edge Network]
        CF --> APP[Next.js App]
    end

    subgraph "Frontend Application"
        APP --> AUTH[Auth Context]
        APP --> RT[Real-time Context]
        APP --> UI[UI Components]
        UI --> GIRLS[Girls Dashboard]
        UI --> DATA[Add Data Page]
        UI --> OV[Overview Dashboard]
    end

    subgraph "Backend Services"
        AUTH --> SUPA[Supabase Auth]
        RT --> REALTIME[Supabase Real-time]
        DATA --> API[API Routes]
        API --> RLS[Row Level Security]
    end

    subgraph "Database Layer"
        RLS --> PG[(PostgreSQL)]
        PG --> USERS[users table]
        PG --> GIRLS_T[girls table]
        PG --> ENTRIES[data_entries table]
        PG --> SESSIONS[onboarding_sessions]
    end

    subgraph "External Services"
        API --> STRIPE[Stripe API]
        STRIPE --> SUB[Subscription Management]
    end

    subgraph "Real-time Flow"
        DATA -.->|Insert Entry| PG
        PG -.->|Real-time Event| REALTIME
        REALTIME -.->|Update UI| GIRLS
        REALTIME -.->|Update Metrics| OV
    end

    U1 & U2 & U3 --> CF
```

### Architectural Patterns

- **Database-First Architecture:** All features built with Supabase integration from day one, preventing local storage migration disasters - _Rationale:_ Eliminates architectural debt and ensures scalable data persistence from the start
- **Real-time Event-Driven UI:** Supabase real-time subscriptions with optimistic updates for immediate user feedback - _Rationale:_ Meets requirement for instant metric updates when adding data entries
- **Multi-Tenant SaaS Pattern:** Row Level Security (RLS) policies for complete data isolation between users - _Rationale:_ Essential for consumer app with thousands of users and subscription tiers
- **Anonymous Session Management:** Temporary data persistence for onboarding flow before account creation - _Rationale:_ Enables seamless user experience from landing page through payment to dashboard
- **Component-Based UI with Context:** React Context for global state management with existing UI components - _Rationale:_ Preserves validated UX while adding database integration
- **API Gateway Pattern:** Next.js API routes as unified backend interface with middleware - _Rationale:_ Centralizes auth, validation, and business logic while maintaining serverless benefits

---

## Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.0+ | Type-safe frontend development | Existing codebase uses TypeScript, essential for shared data models |
| Frontend Framework | Next.js | 14+ | React-based fullstack framework | Preserves existing app structure, excellent Vercel integration |
| UI Component Library | Tailwind CSS + Headless UI | 3.0+ | Styling and components | Matches existing design system, highly customizable |
| State Management | React Context + useReducer | React 18+ | Global state management | Lightweight, suitable for existing app complexity |
| Backend Language | TypeScript | 5.0+ | Unified language across stack | Code sharing between frontend/backend, type safety |
| Backend Framework | Next.js API Routes | 14+ | Serverless API endpoints | Integrated with frontend, automatic deployment |
| API Style | REST + Real-time Subscriptions | - | HTTP APIs + WebSocket events | REST for CRUD, Real-time for instant updates |
| Database | PostgreSQL (Supabase) | 15+ | Primary data storage | Robust relational DB with real-time capabilities |
| Cache | Supabase Edge Cache | - | Query result caching | Built-in optimization for database queries |
| File Storage | Supabase Storage | - | User uploads (future) | Integrated auth and permissions |
| Authentication | Supabase Auth | - | User management and sessions | Complete auth solution with RLS integration |
| Frontend Testing | Jest + React Testing Library | Latest | Component and hook testing | Industry standard, excellent React support |
| Backend Testing | Jest + Supertest | Latest | API endpoint testing | Consistent testing across stack |
| E2E Testing | Playwright | Latest | Full user journey testing | Critical for onboarding flow validation |
| Build Tool | Turborepo | Latest | Monorepo build optimization | Optimal for Vercel deployment pipeline |
| Bundler | Next.js (Webpack) | 14+ | Code bundling and optimization | Built-in with Next.js, excellent performance |
| IaC Tool | Supabase CLI | Latest | Database schema management | Version control for database changes |
| CI/CD | GitHub Actions + Vercel | - | Automated testing and deployment | Seamless integration with chosen platform |
| Monitoring | Vercel Analytics + Supabase Logs | - | Performance and error tracking | Built-in monitoring for both platforms |
| Logging | Console + Supabase Edge Functions | - | Application logging | Serverless-friendly logging approach |
| CSS Framework | Tailwind CSS | 3.0+ | Utility-first styling | Preserves existing design system |

---

## Data Models

### User
**Purpose:** Represents authenticated users with subscription information and preferences

**Key Attributes:**
- id: UUID - Primary identifier linked to Supabase Auth
- email: string - User's email address for authentication
- subscriptionTier: 'boyfriend' | 'player' | 'lifetime' - Determines feature access
- subscriptionStatus: 'active' | 'cancelled' | 'expired' - Current subscription state
- stripeCustomerId: string | null - Stripe customer reference for billing
- createdAt: Date - Account creation timestamp
- updatedAt: Date - Last profile update

#### TypeScript Interface
```typescript
interface User {
  id: string;
  email: string;
  subscriptionTier: 'boyfriend' | 'player' | 'lifetime';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- One-to-many with Girls (user can have multiple dating profiles)
- One-to-many with DataEntries (user can have multiple data entries)

### Girl
**Purpose:** Represents dating profiles with demographics and ratings for tracking purposes

**Key Attributes:**
- id: UUID - Unique profile identifier
- userId: UUID - Foreign key to User
- name: string - Display name for the profile
- age: number - Age (minimum 18 per validation)
- rating: number - Hotness rating (5.0-10.0 in 0.5 increments)
- ethnicity: string | null - Optional demographic information
- hairColor: string | null - Optional physical characteristic
- locationCity: string | null - Optional location data
- locationCountry: string | null - Optional location data
- isActive: boolean - Whether profile is currently active
- createdAt: Date - Profile creation timestamp
- updatedAt: Date - Last profile update

#### TypeScript Interface
```typescript
interface Girl {
  id: string;
  userId: string;
  name: string;
  age: number;
  rating: number;
  ethnicity?: string;
  hairColor?: string;
  locationCity?: string;
  locationCountry?: string;
  nationality?: string; // Backward compatibility
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- Many-to-one with User (profile belongs to one user)
- One-to-many with DataEntries (profile can have multiple data entries)

### DataEntry
**Purpose:** Tracks individual dating interactions with expenses, time, and outcomes

**Key Attributes:**
- id: UUID - Unique entry identifier
- userId: UUID - Foreign key to User (for RLS)
- girlId: UUID - Foreign key to Girl
- date: Date - Date of the interaction
- amountSpent: number - Money spent in dollars (decimal for cents)
- durationMinutes: number - Time spent converted to minutes
- numberOfNuts: number - Count of nuts achieved (integer)
- createdAt: Date - Entry creation timestamp
- updatedAt: Date - Last entry update

#### TypeScript Interface
```typescript
interface DataEntry {
  id: string;
  userId: string;
  girlId: string;
  date: Date;
  amountSpent: number;
  durationMinutes: number;
  numberOfNuts: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- Many-to-one with User (entry belongs to one user)
- Many-to-one with Girl (entry belongs to one profile)

### OnboardingSession
**Purpose:** Temporary storage for anonymous user data during onboarding flow before account creation

**Key Attributes:**
- id: UUID - Session identifier
- sessionToken: string - Unique token for session access
- girlData: object | null - Temporary girl profile data
- dataEntries: array | null - Temporary data entries
- expiresAt: Date - Session expiration (24 hours default)
- createdAt: Date - Session creation timestamp

#### TypeScript Interface
```typescript
interface OnboardingSession {
  id: string;
  sessionToken: string;
  girlData?: Partial<Girl>;
  dataEntries?: Partial<DataEntry>[];
  expiresAt: Date;
  createdAt: Date;
}
```

#### Relationships
- No foreign keys (temporary data before user creation)
- Migrated to User/Girl/DataEntry upon account creation

---

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: CPN App API
  version: 2.0.0
  description: Cost Per Nut application API for dating analytics and user management
servers:
  - url: https://your-app.vercel.app/api
    description: Production API server

paths:
  /auth/signup:
    post:
      summary: Create new user account
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                sessionToken:
                  type: string
                  description: Anonymous session token for data migration
      responses:
        201:
          description: User created successfully
        400:
          description: Invalid input data

  /girls:
    get:
      summary: Get all girls for authenticated user
      responses:
        200:
          description: List of girl profiles with calculated metrics
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/GirlWithMetrics'
    post:
      summary: Create new girl profile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateGirlInput'
      responses:
        201:
          description: Girl profile created
        400:
          description: Validation error

  /girls/{girlId}/data-entries:
    get:
      summary: Get data entries for specific girl
      parameters:
        - name: girlId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: List of data entries
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DataEntry'
    post:
      summary: Add new data entry
      parameters:
        - name: girlId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDataEntryInput'
      responses:
        201:
          description: Data entry created, triggers real-time updates

  /onboarding/session:
    post:
      summary: Create anonymous onboarding session
      responses:
        201:
          description: Session created
          content:
            application/json:
              schema:
                type: object
                properties:
                  sessionToken:
                    type: string
                  expiresAt:
                    type: string
                    format: date-time

  /onboarding/session/{sessionToken}/girl:
    post:
      summary: Add girl data to onboarding session
      parameters:
        - name: sessionToken
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateGirlInput'

  /subscriptions/checkout:
    post:
      summary: Create Stripe checkout session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                tier:
                  type: string
                  enum: [player, lifetime]
                userId:
                  type: string
                  format: uuid
      responses:
        200:
          description: Checkout session created
          content:
            application/json:
              schema:
                type: object
                properties:
                  checkoutUrl:
                    type: string

components:
  schemas:
    GirlWithMetrics:
      allOf:
        - $ref: '#/components/schemas/Girl'
        - type: object
          properties:
            metrics:
              type: object
              properties:
                totalSpent:
                  type: number
                totalNuts:
                  type: integer
                totalMinutes:
                  type: integer
                costPerNut:
                  type: number
                timePerNut:
                  type: number
                entryCount:
                  type: integer

    Girl:
      type: object
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        name:
          type: string
        age:
          type: integer
          minimum: 18
        rating:
          type: number
          minimum: 5.0
          maximum: 10.0
        ethnicity:
          type: string
          nullable: true
        hairColor:
          type: string
          nullable: true
        locationCity:
          type: string
          nullable: true
        locationCountry:
          type: string
          nullable: true
        isActive:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateGirlInput:
      type: object
      required: [name, age]
      properties:
        name:
          type: string
          minLength: 1
        age:
          type: integer
          minimum: 18
        rating:
          type: number
          minimum: 5.0
          maximum: 10.0
          default: 6.0
        ethnicity:
          type: string
        hairColor:
          type: string
        locationCity:
          type: string
        locationCountry:
          type: string

    DataEntry:
      type: object
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        girlId:
          type: string
          format: uuid
        date:
          type: string
          format: date
        amountSpent:
          type: number
          minimum: 0
        durationMinutes:
          type: integer
          minimum: 0
        numberOfNuts:
          type: integer
          minimum: 0
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateDataEntryInput:
      type: object
      required: [date, amountSpent, durationMinutes, numberOfNuts]
      properties:
        date:
          type: string
          format: date
        amountSpent:
          type: number
          minimum: 0
        durationMinutes:
          type: integer
          minimum: 0
        numberOfNuts:
          type: integer
          minimum: 0

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

---

## Components

### Frontend Authentication Service
**Responsibility:** Manages user authentication, session state, and Supabase Auth integration

**Key Interfaces:**
- `signUp(email, password, sessionToken?)` - User registration with optional onboarding data migration
- `signIn(email, password)` - User login
- `signOut()` - User logout
- `getCurrentUser()` - Get current authenticated user

**Dependencies:** Supabase Auth, OnboardingService for data migration

**Technology Stack:** React Context, Supabase Auth SDK, TypeScript

### Real-time Data Manager
**Responsibility:** Handles Supabase real-time subscriptions and optimistic UI updates for immediate feedback

**Key Interfaces:**
- `subscribeToUserData(userId)` - Subscribe to all user's data changes
- `subscribeToGirlMetrics(girlId)` - Subscribe to specific girl's metric updates
- `updateOptimistically(data)` - Immediate UI update before database confirmation

**Dependencies:** Supabase Real-time, State Management Context

**Technology Stack:** Supabase Real-time SDK, React Hooks, WebSocket connections

### Database Service Layer
**Responsibility:** Abstracts database operations with type-safe queries and automatic RLS enforcement

**Key Interfaces:**
- `girls.create(data)` - Create girl profile with user isolation
- `dataEntries.create(data)` - Add data entry with real-time metric recalculation
- `metrics.calculateForGirl(girlId)` - Get aggregated metrics using database functions

**Dependencies:** Supabase PostgreSQL, RLS policies

**Technology Stack:** Supabase SDK, TypeScript, PostgreSQL functions

### Onboarding Session Manager
**Responsibility:** Manages anonymous user data persistence through signup and payment flow

**Key Interfaces:**
- `createSession()` - Generate anonymous session token
- `addGirlData(sessionToken, girlData)` - Store temporary girl data
- `addDataEntry(sessionToken, entryData)` - Store temporary data entries
- `migrateToUser(sessionToken, userId)` - Transfer session data to permanent account

**Dependencies:** Database Service, Supabase storage

**Technology Stack:** Next.js API routes, PostgreSQL JSON storage, UUID generation

### Subscription Management Service
**Responsibility:** Handles Stripe integration, subscription tiers, and feature access control

**Key Interfaces:**
- `createCheckoutSession(tier, userId)` - Generate Stripe checkout URL
- `handleWebhook(stripeEvent)` - Process subscription status changes
- `checkFeatureAccess(userId, feature)` - Verify user's feature permissions

**Dependencies:** Stripe API, User Service, Database Service

**Technology Stack:** Stripe SDK, Next.js API routes, Webhook handling

### Metrics Calculation Engine
**Responsibility:** Real-time calculation of cost per nut, efficiency metrics, and performance analytics

**Key Interfaces:**
- `calculateGirlMetrics(dataEntries)` - Client-side metric calculations
- `updateMetricsRealTime(newEntry)` - Immediate metric updates on data entry
- `getGlobalStatistics(userId)` - Aggregate metrics across all profiles

**Dependencies:** Database functions, Real-time Data Manager

**Technology Stack:** TypeScript calculations, PostgreSQL aggregation functions, React state

---

## Core Workflows

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Supabase
    participant Stripe

    Note over User,Stripe: Critical Onboarding Flow with Data Persistence

    User->>Frontend: Click TikTok/Instagram link
    Frontend->>API: POST /onboarding/session
    API->>Supabase: Create onboarding_sessions record
    Supabase-->>API: Return sessionToken
    API-->>Frontend: Return sessionToken
    Frontend-->>User: Show Step 1: Add Girl

    User->>Frontend: Enter girl data (Sally)
    Frontend->>API: POST /onboarding/session/{token}/girl
    API->>Supabase: Store girlData in session JSONB
    Supabase-->>API: Confirm storage
    API-->>Frontend: Success
    Frontend-->>User: Show Step 2: Add Data

    User->>Frontend: Enter data entry
    Frontend->>API: POST /onboarding/session/{token}/data-entry
    API->>Supabase: Append to dataEntries JSONB
    Supabase-->>API: Confirm storage
    API-->>Frontend: Success
    Frontend-->>User: Show Step 3: Authentication

    User->>Frontend: Sign up with email/password
    Frontend->>API: POST /auth/signup (with sessionToken)
    API->>Supabase: Create user account
    Supabase-->>API: Return userId
    API->>API: Migrate session data to permanent tables
    API->>Supabase: Create girls record with session data
    API->>Supabase: Create data_entries with session data
    API->>Supabase: Delete onboarding session
    API-->>Frontend: User created with migrated data
    Frontend-->>User: Show Results with calculated CPN

    User->>Frontend: Choose subscription (Player/Lifetime)
    Frontend->>API: POST /subscriptions/checkout
    API->>Stripe: Create checkout session
    Stripe-->>API: Return checkout URL
    API-->>Frontend: Redirect to Stripe
    Frontend-->>User: Stripe payment page

    User->>Stripe: Complete payment
    Stripe->>API: Webhook: payment successful
    API->>Supabase: Update user subscription_tier and status
    Supabase-->>API: Confirm update
    API-->>Stripe: Webhook received
    Stripe-->>Frontend: Redirect to success page
    Frontend-->>User: Welcome to dashboard with Sally already present
```

---

## Database Schema

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (integrates with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'boyfriend'
    CHECK (subscription_tier IN ('boyfriend', 'player', 'lifetime')),
  subscription_status TEXT DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Girls table (dating profiles)
CREATE TABLE girls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  rating DECIMAL(3,1) NOT NULL DEFAULT 6.0
    CHECK (rating >= 5.0 AND rating <= 10.0 AND (rating * 10)::INTEGER % 5 = 0),
  ethnicity TEXT,
  hair_color TEXT,
  location_city TEXT,
  location_country TEXT,
  nationality TEXT, -- Backward compatibility with existing data
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data entries table (expense/outcome tracking)
CREATE TABLE data_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  girl_id UUID REFERENCES girls(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_spent DECIMAL(10,2) NOT NULL CHECK (amount_spent >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
  number_of_nuts INTEGER NOT NULL CHECK (number_of_nuts >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding sessions (anonymous data persistence)
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  girl_data JSONB,
  data_entries JSONB DEFAULT '[]'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_girls_user_id ON girls(user_id);
CREATE INDEX idx_girls_user_active ON girls(user_id, is_active);
CREATE INDEX idx_data_entries_user_id ON data_entries(user_id);
CREATE INDEX idx_data_entries_girl_id ON data_entries(girl_id);
CREATE INDEX idx_data_entries_date ON data_entries(date);
CREATE INDEX idx_data_entries_user_girl ON data_entries(user_id, girl_id);
CREATE INDEX idx_onboarding_token ON onboarding_sessions(session_token);
CREATE INDEX idx_onboarding_expires ON onboarding_sessions(expires_at);

-- Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE girls ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own profile" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own girls" ON girls
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data entries" ON data_entries
  FOR ALL USING (auth.uid() = user_id);

-- Onboarding sessions accessible by session token
CREATE POLICY "Session token access" ON onboarding_sessions
  FOR ALL USING (true); -- Access controlled by session_token parameter

-- Automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_girls_updated_at BEFORE UPDATE ON girls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_entries_updated_at BEFORE UPDATE ON data_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Real-time metrics calculation function
CREATE OR REPLACE FUNCTION calculate_girl_metrics(girl_uuid UUID)
RETURNS TABLE (
  total_spent DECIMAL(10,2),
  total_nuts INTEGER,
  total_minutes INTEGER,
  cost_per_nut DECIMAL(10,2),
  time_per_nut DECIMAL(10,2),
  entry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(amount_spent), 0) as total_spent,
    COALESCE(SUM(number_of_nuts), 0) as total_nuts,
    COALESCE(SUM(duration_minutes), 0) as total_minutes,
    CASE
      WHEN SUM(number_of_nuts) > 0 THEN ROUND(SUM(amount_spent) / SUM(number_of_nuts), 2)
      ELSE 0
    END as cost_per_nut,
    CASE
      WHEN SUM(number_of_nuts) > 0 THEN ROUND(SUM(duration_minutes)::DECIMAL / SUM(number_of_nuts), 2)
      ELSE 0
    END as time_per_nut,
    COUNT(*)::INTEGER as entry_count
  FROM data_entries
  WHERE girl_id = girl_uuid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired onboarding sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM onboarding_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension in production)
-- SELECT cron.schedule('cleanup-sessions', '0 */6 * * *', 'SELECT cleanup_expired_sessions();');
```

---

## Unified Project Structure

```
cpn-bmad-method-1/
├── .github/                          # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml                   # Test and build pipeline
│       └── deploy.yaml               # Deployment pipeline
├── apps/                             # Application packages
│   └── web/                          # Next.js application
│       ├── app/                      # Next.js 14+ app directory (PRESERVE EXISTING)
│       │   ├── (auth)/              # Authentication routes
│       │   ├── (onboarding)/        # Onboarding flow
│       │   ├── (dashboard)/         # Protected app routes
│       │   ├── api/                 # API routes
│       │   ├── globals.css          # Global styles
│       │   ├── layout.tsx           # Root layout
│       │   └── page.tsx             # Landing page
│       ├── components/              # UI components (PRESERVE EXISTING)
│       │   ├── ui/                  # Basic UI components
│       │   ├── forms/               # Form components
│       │   ├── modals/              # Modal components (PRESERVE)
│       │   ├── cards/               # Data display cards
│       │   └── layouts/             # Layout components
│       ├── lib/                     # Frontend utilities (PRESERVE EXISTING)
│       │   ├── context.tsx          # PRESERVE - migrate to database
│       │   ├── storage.ts           # PRESERVE - reference for migration
│       │   ├── calculations.ts      # PRESERVE - move to shared
│       │   ├── types.ts             # PRESERVE - move to shared
│       │   └── utils.ts             # PRESERVE utilities
│       ├── hooks/                   # Custom React hooks
│       │   ├── useAuth.ts           # Authentication hook
│       │   ├── useRealtime.ts       # Real-time subscriptions
│       │   ├── useGirls.ts          # Girls data management
│       │   └── useDataEntries.ts    # Data entries management
│       ├── services/                # API client services
│       │   ├── apiClient.ts         # Base API client
│       │   ├── girlsService.ts      # Girls API service
│       │   ├── dataEntriesService.ts # Data entries API service
│       │   └── subscriptionService.ts # Subscription API service
│       ├── middleware.ts            # Auth middleware
│       ├── next.config.js           # Next.js configuration
│       └── package.json
├── packages/                        # Shared packages
│   ├── shared/                      # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/               # Shared TypeScript interfaces
│   │   │   │   ├── database.ts      # Supabase generated types
│   │   │   │   ├── api.ts           # API request/response types
│   │   │   │   └── index.ts         # Exported types
│   │   │   ├── constants/           # Shared constants
│   │   │   │   ├── subscriptions.ts # Subscription tiers
│   │   │   │   └── validation.ts    # Validation schemas
│   │   │   ├── utils/               # Shared utilities
│   │   │   │   ├── calculations.ts  # Metrics calculations
│   │   │   │   ├── formatting.ts    # Data formatting
│   │   │   │   └── validation.ts    # Input validation
│   │   │   └── index.ts             # Package exports
│   │   └── package.json
│   ├── database/                    # Database utilities
│   │   ├── src/
│   │   │   ├── client.ts            # Supabase client configuration
│   │   │   ├── migrations/          # Database migration files
│   │   │   ├── seeds/               # Seed data for development
│   │   │   └── types.ts             # Database type definitions
│   │   └── package.json
│   └── config/                      # Shared configuration
│       ├── eslint/                  # ESLint configurations
│       ├── typescript/              # TypeScript configurations
│       └── tailwind/                # Tailwind CSS configurations
├── supabase/                        # Supabase configuration
│   ├── config.toml                  # Supabase project config
│   ├── migrations/                  # Database migrations
│   │   └── 20240928000000_initial_schema.sql
│   └── seed.sql                     # Development seed data
├── docs/                            # Documentation (PRESERVE EXISTING)
│   ├── brief.md                     # Project brief
│   ├── prd.md                       # Product requirements
│   ├── architecture.md              # This architecture document
│   └── deployment.md                # Deployment guide
├── spec/                            # Feature specifications (PRESERVE)
│   ├── FEATURES-INDEX.md            # Feature index
│   └── features/                    # Individual feature specs
├── scripts/                         # Build/deploy scripts
│   ├── setup.sh                     # Local development setup
│   ├── migrate.sh                   # Database migration script
│   └── deploy.sh                    # Deployment script
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Root package.json
├── turbo.json                       # Turborepo configuration
└── README.md                        # Project documentation
```

---

## Development Workflow

### Local Development Setup

#### Prerequisites
```bash
# Install required tools
node --version  # v18.0.0 or higher
npm --version   # v8.0.0 or higher
git --version   # Latest stable

# Install Supabase CLI
npm install -g supabase@latest

# Verify installation
supabase --version
```

#### Initial Setup
```bash
# Clone repository and install dependencies
git clone <repository-url>
cd cpn-bmad-method-1
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Initialize Supabase project
supabase init
supabase start

# Run initial database migration
supabase db reset

# Generate TypeScript types
npm run generate-types

# Start development server
npm run dev
```

#### Development Commands
```bash
# Start all services
npm run dev                    # Starts Next.js dev server + Supabase locally

# Start frontend only
npm run dev:web               # Next.js development server

# Start database only
supabase start                # Local Supabase instance

# Database operations
npm run db:reset              # Reset database with latest migrations
npm run db:migrate            # Apply pending migrations
npm run db:seed               # Seed development data
npm run generate-types        # Generate TypeScript types from schema

# Testing
npm run test                  # Run all tests
npm run test:unit             # Unit tests only
npm run test:integration      # Integration tests only
npm run test:e2e              # End-to-end tests only

# Build and deploy
npm run build                 # Build for production
npm run start                 # Start production server
npm run deploy                # Deploy to production
```

### Environment Configuration

#### Required Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend (.env)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Shared
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
NODE_ENV=development
```

---

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' *.supabase.co *.stripe.com`
- XSS Prevention: Input sanitization, Content Security Policy, React built-in protections
- Secure Storage: Sensitive data in httpOnly cookies, auth tokens in memory only

**Backend Security:**
- Input Validation: Zod schemas for all API endpoints, SQL injection prevention via Supabase ORM
- Rate Limiting: 100 requests/minute per IP, 1000 requests/hour per authenticated user
- CORS Policy: Restricted to production domains and localhost for development

**Authentication Security:**
- Token Storage: Access tokens in memory, refresh tokens in httpOnly cookies
- Session Management: Supabase Auth with automatic token refresh and secure logout
- Password Policy: Minimum 8 characters, enforced by Supabase Auth

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: <300KB initial bundle, <100KB per route
- Loading Strategy: Route-based code splitting, component lazy loading, image optimization
- Caching Strategy: React Query for API data, service worker for static assets

**Backend Performance:**
- Response Time Target: <200ms for API endpoints, <100ms for cached responses
- Database Optimization: Proper indexing, RLS policies, connection pooling via Supabase
- Caching Strategy: Supabase Edge Cache, Vercel Edge Functions, Redis for session data

---

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there - prevents frontend/backend type mismatches
- **API Calls:** Never make direct HTTP calls - use the service layer for consistent error handling and auth
- **Environment Variables:** Access only through config objects, never process.env directly in components
- **Error Handling:** All API routes must use the standard error handler with proper HTTP status codes
- **State Updates:** Never mutate state directly - use proper React state management patterns
- **Database Queries:** Always use RLS-enabled queries, never bypass Row Level Security
- **Real-time Updates:** Use optimistic updates + real-time subscriptions for immediate UI feedback
- **Session Management:** Store onboarding data in database sessions, not localStorage during signup flow

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `GirlCard.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/data-entries` |
| Database Tables | - | snake_case | `data_entries` |
| Database Functions | - | snake_case | `calculate_girl_metrics` |
| Environment Variables | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |

---

## Monitoring and Observability

### Monitoring Stack
- **Frontend Monitoring:** Vercel Analytics for Core Web Vitals, user interactions, and performance metrics
- **Backend Monitoring:** Vercel Functions analytics for API performance, error rates, and usage patterns
- **Error Tracking:** Built-in Next.js error boundaries + Supabase logging for centralized error collection
- **Performance Monitoring:** Real User Monitoring (RUM) via Vercel, database query performance via Supabase dashboard

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors and stack traces
- API response times from client perspective
- User interaction events (button clicks, form submissions)
- Real-time subscription connection health
- Onboarding funnel conversion rates

**Backend Metrics:**
- API request rate and response times
- Database query performance and slow queries
- Authentication success/failure rates
- Subscription webhook processing status
- RLS policy enforcement metrics
- Real-time subscription connection counts

---

**Architecture Document Complete**
*This comprehensive architecture provides the foundation for implementing your CPN app's database-first Supabase migration with bulletproof multi-tenant security and real-time performance.*