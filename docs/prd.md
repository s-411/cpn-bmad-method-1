# Product Requirements Document: CPN App v2.0
## Supabase Architecture Migration

**Version:** 2.0
**Date:** September 28, 2024
**Status:** Draft
**Project:** CPN App - Database-First Rebuild

---

## 1. Product Overview

### 1.1 Product Vision
Transform the validated CPN (Cost Per Nut) local storage prototype into a scalable, multi-user Supabase-powered consumer application supporting thousands of users across freemium and premium subscription tiers.

### 1.2 Success Criteria
- **Zero data mixing** between user accounts
- **Real-time data updates** across all interfaces
- **Seamless onboarding** with data persistence through payment flow
- **100% feature parity** with working local storage prototype
- **Sub-500ms performance** for all authenticated operations

### 1.3 Key Metrics
- **Technical:** <200ms database query response times
- **Business:** 15% free-to-paid conversion rate
- **User:** 85% onboarding completion rate

---

## 2. Database Architecture & Schema

### 2.1 Core Database Design

**CRITICAL SUCCESS FACTOR:** Database schema must be designed and tested FIRST before any feature migration.

#### 2.1.1 Primary Tables

```sql
-- Users table (Supabase Auth integration)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'boyfriend' CHECK (subscription_tier IN ('boyfriend', 'player', 'lifetime')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
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
  rating DECIMAL(3,1) NOT NULL DEFAULT 6.0 CHECK (rating >= 5.0 AND rating <= 10.0),
  ethnicity TEXT,
  hair_color TEXT,
  location_city TEXT,
  location_country TEXT,
  nationality TEXT, -- backward compatibility
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
  data_entries JSONB,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.1.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE girls ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own girls" ON girls
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own data entries" ON data_entries
  FOR ALL USING (auth.uid() = user_id);

-- Onboarding sessions use token-based access
CREATE POLICY "Session token access" ON onboarding_sessions
  FOR ALL USING (session_token = current_setting('request.jwt.claims')::json->>'session_token');
```

#### 2.1.3 Database Functions for Real-time Calculations

```sql
-- Function to calculate metrics for a girl
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
      WHEN SUM(number_of_nuts) > 0 THEN SUM(amount_spent) / SUM(number_of_nuts)
      ELSE 0
    END as cost_per_nut,
    CASE
      WHEN SUM(number_of_nuts) > 0 THEN SUM(duration_minutes)::DECIMAL / SUM(number_of_nuts)
      ELSE 0
    END as time_per_nut,
    COUNT(*)::INTEGER as entry_count
  FROM data_entries
  WHERE girl_id = girl_uuid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.2 Indexes for Performance

```sql
-- Critical indexes for real-time performance
CREATE INDEX idx_girls_user_id ON girls(user_id);
CREATE INDEX idx_data_entries_user_id ON data_entries(user_id);
CREATE INDEX idx_data_entries_girl_id ON data_entries(girl_id);
CREATE INDEX idx_data_entries_date ON data_entries(date);
CREATE INDEX idx_onboarding_sessions_token ON onboarding_sessions(session_token);
CREATE INDEX idx_onboarding_sessions_expires ON onboarding_sessions(expires_at);
```

---

## 3. User Authentication & Onboarding Flow

### 3.1 Anonymous Onboarding with Data Persistence

#### 3.1.1 User Journey Flow
1. **Landing:** User clicks TikTok/Instagram link → App generates anonymous session token
2. **Step 1:** Add first girl (Sally) → Store in `onboarding_sessions` table with session token
3. **Step 2:** Add data entry → Append to session's `data_entries` JSONB
4. **Step 3:** Authentication → User creates account with email/password
5. **Results:** Show calculated CPN results from session data
6. **Payment:** Stripe checkout → Subscription tier selection
7. **Migration:** Transfer session data to user's permanent account
8. **Dashboard:** User sees Sally and data already populated

#### 3.1.2 Technical Implementation

```typescript
// Onboarding session management
interface OnboardingSession {
  id: string;
  sessionToken: string;
  girlData: {
    name: string;
    age: number;
    rating: number;
    // ... other girl fields
  };
  dataEntries: Array<{
    date: string;
    amountSpent: number;
    durationMinutes: number;
    numberOfNuts: number;
  }>;
  expiresAt: string;
}

// Session data migration after account creation
async function migrateOnboardingData(userId: string, sessionToken: string) {
  const { data: session } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .single();

  if (session) {
    // Create girl profile
    const { data: girl } = await supabase
      .from('girls')
      .insert({
        user_id: userId,
        ...session.girl_data
      })
      .select()
      .single();

    // Create data entries
    const dataEntries = session.data_entries.map(entry => ({
      user_id: userId,
      girl_id: girl.id,
      ...entry
    }));

    await supabase.from('data_entries').insert(dataEntries);

    // Clean up session
    await supabase.from('onboarding_sessions').delete().eq('id', session.id);
  }
}
```

### 3.2 Subscription Management Integration

#### 3.2.1 Stripe Integration Points
- **Checkout:** Create Stripe customer during account creation
- **Webhooks:** Handle subscription status changes via webhook endpoints
- **Plan Access:** Enforce feature restrictions based on subscription tier

#### 3.2.2 Subscription Tiers & Feature Access

| Feature | Boyfriend (Free) | Player ($1.99/week) | Lifetime ($27) |
|---------|------------------|---------------------|----------------|
| Basic girl profiles | ✅ | ✅ | ✅ |
| Data entry & tracking | ✅ | ✅ | ✅ |
| Real-time metrics | ✅ | ✅ | ✅ |
| Overview dashboard | ✅ | ✅ | ✅ |
| Analytics dashboard | ❌ | ✅ | ✅ |
| Custom sharing | ❌ | ✅ | ✅ |
| Advanced features | ❌ | ❌ | ✅ |

---

## 4. Real-time Data Management

### 4.1 Supabase Real-time Implementation

#### 4.1.1 Real-time Subscriptions
```typescript
// Real-time subscription for user's data
const setupRealTimeSubscriptions = (userId: string) => {
  // Girls table changes
  const girlsSubscription = supabase
    .channel('girls_changes')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'girls',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        // Update girls state immediately
        updateGirlsState(payload);
      }
    )
    .subscribe();

  // Data entries table changes
  const dataSubscription = supabase
    .channel('data_entries_changes')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'data_entries',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        // Update data entries and recalculate metrics
        updateDataEntriesState(payload);
        recalculateMetrics(payload.new?.girl_id);
      }
    )
    .subscribe();
};
```

#### 4.1.2 Optimistic UI Updates
```typescript
// Add data entry with immediate UI update
const addDataEntry = async (entryData: DataEntryInput) => {
  // 1. Immediate optimistic update
  const tempEntry = {
    id: `temp-${Date.now()}`,
    ...entryData,
    created_at: new Date().toISOString()
  };

  setDataEntries(prev => [...prev, tempEntry]);
  updateMetricsOptimistically(entryData);

  // 2. Database insert
  const { data, error } = await supabase
    .from('data_entries')
    .insert(entryData)
    .select()
    .single();

  if (error) {
    // Rollback optimistic update
    setDataEntries(prev => prev.filter(e => e.id !== tempEntry.id));
    rollbackMetrics();
    showError(error.message);
  } else {
    // Replace temp with real data
    setDataEntries(prev =>
      prev.map(e => e.id === tempEntry.id ? data : e)
    );
  }
};
```

### 4.2 Performance Requirements

#### 4.2.1 Response Time Targets
- **Database queries:** <200ms average
- **Real-time updates:** <100ms propagation
- **Page navigation:** <500ms
- **Initial page load:** <2 seconds

#### 4.2.2 Caching Strategy
```typescript
// React Query for data caching and synchronization
const useGirlsWithMetrics = (userId: string) => {
  return useQuery({
    queryKey: ['girls', 'metrics', userId],
    queryFn: async () => {
      const { data: girls } = await supabase
        .from('girls')
        .select(`
          *,
          data_entries (
            id,
            amount_spent,
            duration_minutes,
            number_of_nuts,
            date
          )
        `)
        .eq('user_id', userId);

      return girls.map(girl => ({
        ...girl,
        metrics: calculateMetricsClient(girl.data_entries)
      }));
    },
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  });
};
```

---

## 5. Feature Specifications

### 5.1 Core MVP Features

#### 5.1.1 Girl Profile Management
**Database Integration:**
- All CRUD operations use Supabase with RLS
- Real-time updates across all components
- Form validation matches database constraints

**Key Changes from Local Storage:**
```typescript
// Before (localStorage)
const addGirl = (girlData) => {
  const girls = JSON.parse(localStorage.getItem('cpn_girls') || '[]');
  girls.push({ ...girlData, id: generateId() });
  localStorage.setItem('cpn_girls', JSON.stringify(girls));
};

// After (Supabase)
const addGirl = async (girlData) => {
  const { data, error } = await supabase
    .from('girls')
    .insert(girlData)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

#### 5.1.2 Data Entry System
**Real-time Requirements:**
- Form submission immediately updates right sidebar metrics
- History table updates instantly with new entry
- Navigation to other pages shows updated totals
- All calculations happen in real-time without page refresh

**Implementation Approach:**
```typescript
const AddDataPage = ({ girlId }: { girlId: string }) => {
  const [metrics, setMetrics] = useState(null);
  const [entries, setEntries] = useState([]);

  // Real-time subscription for this girl's data
  useEffect(() => {
    const subscription = supabase
      .channel(`girl_${girlId}_data`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_entries',
          filter: `girl_id=eq.${girlId}`
        },
        (payload) => {
          // Immediately update local state
          if (payload.eventType === 'INSERT') {
            setEntries(prev => [...prev, payload.new]);
            updateMetricsFromEntries([...entries, payload.new]);
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [girlId]);

  const handleSubmit = async (formData) => {
    // Optimistic update
    const tempEntry = { ...formData, id: `temp-${Date.now()}` };
    setEntries(prev => [...prev, tempEntry]);
    updateMetricsFromEntries([...entries, tempEntry]);

    // Database insert
    const { data, error } = await supabase
      .from('data_entries')
      .insert({ ...formData, girl_id: girlId })
      .select()
      .single();

    if (error) {
      // Rollback on error
      setEntries(prev => prev.filter(e => e.id !== tempEntry.id));
      // Recalculate metrics without temp entry
    } else {
      // Replace temp with real data
      setEntries(prev => prev.map(e => e.id === tempEntry.id ? data : e));
    }
  };
};
```

#### 5.1.3 Overview Dashboard
**Performance Considerations:**
- Load all girls with aggregated metrics in single query
- Use database functions for complex calculations
- Implement virtual scrolling for large datasets
- Cache calculated metrics with proper invalidation

```sql
-- Optimized query for overview dashboard
SELECT
  g.*,
  COALESCE(m.total_spent, 0) as total_spent,
  COALESCE(m.total_nuts, 0) as total_nuts,
  COALESCE(m.total_minutes, 0) as total_minutes,
  COALESCE(m.cost_per_nut, 0) as cost_per_nut,
  COALESCE(m.time_per_nut, 0) as time_per_nut,
  COALESCE(m.entry_count, 0) as entry_count
FROM girls g
LEFT JOIN LATERAL calculate_girl_metrics(g.id) m ON true
WHERE g.user_id = auth.uid()
ORDER BY g.created_at DESC;
```

### 5.2 Subscription-Gated Features

#### 5.2.1 Feature Access Control
```typescript
const useFeatureAccess = () => {
  const { data: user } = useUser();

  return {
    canAccessAnalytics: ['player', 'lifetime'].includes(user?.subscription_tier),
    canAccessSharing: ['player', 'lifetime'].includes(user?.subscription_tier),
    canAccessAdvanced: user?.subscription_tier === 'lifetime',
    hasActiveSubscription: user?.subscription_status === 'active'
  };
};
```

---

## 6. Migration Strategy

### 6.1 Phase 1: Foundation (Weeks 1-3)
1. **Database Setup:** Create all tables, RLS policies, functions
2. **Authentication:** Implement Supabase Auth with onboarding flow
3. **Basic CRUD:** Girls and data entries with real-time updates
4. **Testing:** Comprehensive testing of data isolation and performance

### 6.2 Phase 2: Core Features (Weeks 4-8)
1. **Add Data Page:** Real-time form with immediate metric updates
2. **Overview Dashboard:** Optimized queries with caching
3. **Subscription Integration:** Stripe webhooks and plan enforcement
4. **Onboarding Migration:** Anonymous session to user account transfer

### 6.3 Phase 3: Polish & Launch (Weeks 9-12)
1. **Performance Optimization:** Query optimization and caching
2. **Error Handling:** Robust error states and recovery
3. **Testing:** Load testing with projected user volumes
4. **Deployment:** Production deployment with monitoring

---

## 7. Success Criteria & Testing

### 7.1 Database Performance Tests
- **Load Test:** 1000 concurrent users with 10,000 girls and 100,000 data entries
- **Query Performance:** All queries <200ms under load
- **Real-time Updates:** <100ms propagation time for data changes

### 7.2 Data Integrity Tests
- **RLS Verification:** Confirm zero data leakage between users
- **Onboarding Flow:** Test session data migration accuracy
- **Subscription Enforcement:** Verify feature access restrictions

### 7.3 User Experience Tests
- **Real-time Updates:** Add data entry → immediate UI updates across all views
- **Navigation Performance:** <500ms page transitions
- **Offline Handling:** Graceful degradation and sync when reconnected

---

## 8. Risk Mitigation

### 8.1 Technical Risks
**Database Performance:** Implement comprehensive indexing and query optimization from day one
**Real-time Complexity:** Use proven Supabase real-time patterns with fallback polling
**Migration Complexity:** Build migration tools and test thoroughly before production

### 8.2 Business Risks
**User Onboarding:** A/B test onboarding flow to optimize conversion
**Subscription Conversion:** Monitor funnel metrics and optimize payment flow
**Feature Adoption:** Track feature usage to prioritize development efforts

---

## Next Steps

1. **Immediate:** Set up Supabase project and implement database schema
2. **Week 1:** Build authentication and onboarding session management
3. **Week 2:** Implement core CRUD operations with RLS testing
4. **Week 3:** Add real-time subscriptions and optimistic UI updates

This PRD provides the complete technical specification for rebuilding your CPN app with bulletproof Supabase architecture. The database-first approach ensures we avoid the previous migration disasters while maintaining all your validated features and user experience.