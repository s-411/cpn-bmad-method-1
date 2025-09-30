# LocalStorage to Supabase Migration: Complete Guide & Issue Resolution

## Comprehensive Documentation for AI-Assisted Migration

Based on the successful migration of MM Health Tracker from localStorage to Supabase multi-user system, this document provides a complete roadmap for avoiding common pitfalls and implementing best practices.

---

## 1. PRE-MIGRATION ASSESSMENT

### Critical Issues to Identify Before Starting:

**🔍 Multiple Supabase Project Contamination**
- Check browser dev tools → Application → Cookies for multiple `sb-*` entries
- Look for different project references in localStorage/sessionStorage
- Identify any existing Supabase auth tokens from other projects

**🔍 Authentication State Management**
- Map all localStorage.getItem() calls related to auth
- Identify sessionStorage dependencies
- Find hardcoded project references in code

**🔍 Component Render Patterns**
- Search for `router.push()` or `navigate()` calls in component bodies
- Look for direct state updates during render
- Identify conditional routing logic

**🔍 SSR Compatibility Issues**
- Find `document.*` or `window.*` access without browser checks
- Identify client-side only APIs used during SSR
- Check for hydration mismatches

**🔍 Context Architecture**
- Map existing context providers and their import paths
- Identify inconsistent import statements (@/contexts vs @/lib/context)
- Find circular dependencies between contexts

---

## 2. CRITICAL ISSUES & PROVEN SOLUTIONS

### 🚨 Issue #1: Multiple Supabase Authentication Conflicts

**Symptoms:**
```
Failed to create profile: duplicate key value violates unique constraint
AuthSessionMissingError: Auth session missing!
Profile detection fails despite user being authenticated
Issues persist even in incognito mode
```

**Root Cause:** Browser contains cached auth tokens from multiple Supabase projects, causing auth state confusion

**Complete Solution:**

1. **Create Nuclear Cleanup Tool** (`clear-auth.html`):
```html
<script>
function clearAuth() {
    // Clear ALL cookies except target project
    document.cookie.split(";").forEach(function(c) {
        const name = c.trim().split('=')[0];
        if (!name.includes('TARGET_PROJECT_REF') &&
            !name.includes('__cf_bm') && name.trim() !== '') {
            // Clear for all possible domains
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=localhost";
        }
    });

    // Clear localStorage except target project
    Object.keys(localStorage).forEach(key => {
        if (!key.includes('TARGET_PROJECT_REF')) {
            localStorage.removeItem(key);
        }
    });
}
</script>
```

2. **Middleware Cookie Filtering** (`src/middleware.ts`):
```typescript
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      get(name: string) {
        // ONLY return cookies for target project
        if (!name.includes('TARGET_PROJECT_REF')) {
          return undefined
        }
        return request.cookies.get(name)?.value
      },
      // ... set and remove with same filtering
    }
  }
)
```

3. **Client-Side Cookie Filtering** (`src/lib/supabase/client.ts`):
```typescript
export const createClientSupabase = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // Browser environment check first
        if (typeof document === 'undefined') return undefined

        // Project-specific filtering
        if (!name.includes('TARGET_PROJECT_REF')) {
          return undefined
        }

        return document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1]
      },
      // ... similar filtering for set/remove
    }
  })
}
```

### 🚨 Issue #2: React Router Component Update Errors

**Symptoms:**
```
Cannot update a component (Router) while rendering a different component (ProfileSetupPage)
Warning: Cannot update during an existing state transition
Navigation breaks during auth state changes
```

**Root Cause:** `router.push()` called during component render instead of in effect

**Solution:**
```typescript
// ❌ WRONG - Causes component update errors
export default function ProfileSetupPage() {
  const { user, loading } = useAuth()

  if (!loading && !user) {
    router.push('/auth/login') // ⚠️ Called during render!
  }

  return <div>...</div>
}

// ✅ CORRECT - Use useEffect for side effects
export default function ProfileSetupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router]) // ✅ Proper dependency array

  return <div>...</div>
}
```

### 🚨 Issue #3: Server-Side Rendering Conflicts

**Symptoms:**
```
ReferenceError: document is not defined
ReferenceError: window is not defined
Hydration failed because the initial UI does not match
```

**Root Cause:** Client-side code executing during server-side rendering

**Solution Pattern:**
```typescript
// ✅ Always check environment before accessing browser APIs
get(name: string) {
  // Environment check FIRST
  if (typeof document === 'undefined') return undefined

  // Project filtering SECOND
  if (!name.includes('TARGET_PROJECT_REF')) {
    return undefined
  }

  // Safe to access document now
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1]
}

// ✅ For window access
if (typeof window !== 'undefined') {
  // Browser-only code here
}
```

### 🚨 Issue #4: Profile Detection After Authentication

**Symptoms:**
```
User shows as authenticated in logs
Database confirms profile exists
Profile queries return empty/null
Profile context shows loading forever
```

**Root Cause:** Auth state not properly synchronized between server/client due to cookie conflicts

**Solution:**
1. Apply cookie filtering solutions from Issue #1
2. Ensure consistent project references
3. Verify RLS policies are correct
4. Add comprehensive logging to profile fetch process

### 🚨 Issue #5: Import Path Inconsistencies

**Symptoms:**
```
Module not found: Can't resolve '@/contexts/AuthContext'
Cannot find module '@/lib/context/ProfileContext'
```

**Root Cause:** Mixed import paths across codebase

**Solution:**
```typescript
// ✅ Standardize on one pattern - preferably:
import { useAuth } from '@/lib/context/AuthContext'
import { useProfile } from '@/lib/context/ProfileContext'

// ❌ Avoid mixing patterns:
import { useAuth } from '@/contexts/AuthContext'      // Different path
import { useProfile } from '@/lib/context/ProfileContext' // Mixed with above
```

---

## 3. PROVEN MIGRATION STRATEGY

### Phase 1: Backend Foundation (Do This First!)
```markdown
1. **Clean Database Schema Design**
   - Proper foreign key relationships
   - Row Level Security (RLS) policies
   - Check constraints for data validation

2. **TypeScript Integration**
   - Generate types from Supabase schema
   - Create proper Database interface
   - Align existing interfaces with DB schema

3. **Authentication Architecture**
   - Set up AuthContext with proper error handling
   - Create ProfileContext that depends on AuthContext
   - Implement cookie filtering from day one

4. **Environment Configuration**
   - Add missing Supabase env variables
   - Add graceful degradation for missing env vars
   - Test with and without env vars
```

### Phase 2: Ruthless Cleanup (Critical!)
```markdown
1. **Nuclear Auth Cleanup**
   - Create and use clear-auth.html tool
   - Clear browser dev tools manually
   - Test in fresh incognito window

2. **Remove Competing Projects**
   - Search codebase for other Supabase project refs
   - Remove hardcoded project IDs
   - Clean up any remaining localStorage dependencies

3. **Standardize Architecture**
   - Fix all import path inconsistencies
   - Add proper TypeScript types everywhere
   - Implement consistent error handling
```

### Phase 3: Page-by-Page Migration (Systematic!)
```markdown
1. **Start with Core Authentication Pages**
   - Login/Register pages first
   - Profile setup page
   - Test auth flow thoroughly before proceeding

2. **Main Application Pages**
   - Daily tracker (most complex data interactions)
   - Dashboard/analytics
   - User profile management

3. **Specialized Feature Pages**
   - Domain-specific pages (injections, training, etc.)
   - Analytics and reporting
   - Administrative functions

⚠️ **Complete each page fully before moving to the next!**
```

---

## 4. TECHNICAL IMPLEMENTATION PATTERNS

### Authentication Context Pattern
```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ✅ Proper provider implementation with error boundaries
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Handle auth state changes, session refresh, etc.

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Row Level Security Patterns
```sql
-- ✅ Proper RLS policy template
CREATE POLICY "Users can only access own data" ON table_name
FOR ALL USING (auth.uid() = user_id);

-- ✅ More specific policies for different operations
CREATE POLICY "Users can read own data" ON table_name
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON table_name
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON table_name
FOR UPDATE USING (auth.uid() = user_id);

-- ✅ Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Supabase Client Configuration Template
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClientSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // 1. Environment check first
        if (typeof document === 'undefined') return undefined

        // 2. Project filtering second
        if (!name.includes('YOUR_PROJECT_REF')) {
          return undefined
        }

        // 3. Safe cookie parsing
        return document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1]
      },

      set(name: string, value: string, options) {
        if (typeof document === 'undefined') return
        if (!name.includes('YOUR_PROJECT_REF')) return

        let cookie = `${name}=${value}`
        if (options?.expires) cookie += `; expires=${options.expires.toUTCString()}`
        if (options?.path) cookie += `; path=${options.path}`
        // ... other options

        document.cookie = cookie
      },

      remove(name: string, options) {
        if (typeof document === 'undefined') return
        if (!name.includes('YOUR_PROJECT_REF')) return

        let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`
        if (options?.path) cookie += `; path=${options.path}`

        document.cookie = cookie
      }
    }
  })
}
```

### Data Fetching Patterns
```typescript
// ✅ Proper data fetching with error handling
export async function fetchUserData(userId: string) {
  try {
    const supabase = createClientSupabase()

    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user data:', error)
      throw error
    }

    return data
  } catch (err) {
    console.error('fetchUserData failed:', err)
    throw err
  }
}

// ✅ React hook pattern for data fetching
export function useUserData(userId?: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchUserData(userId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  return { data, loading, error }
}
```

---

## 5. VALIDATION & TESTING CHECKLIST

### 🧪 Authentication Flow Testing
- [ ] **Fresh Browser Test**: Clear all data, test complete auth flow
- [ ] **Cross-Device Test**: Login from different devices, verify data sync
- [ ] **Incognito Test**: Works properly in private browsing mode
- [ ] **Network Offline Test**: Handles offline scenarios gracefully
- [ ] **Session Expiry Test**: Properly handles expired sessions

### 🧪 Data Isolation Testing
- [ ] **Multi-User Test**: Multiple users can use app simultaneously
- [ ] **Data Leakage Test**: User A cannot see User B's data
- [ ] **RLS Verification**: Database policies enforced at query level
- [ ] **Direct Database Test**: Manual database queries respect RLS

### 🧪 Technical Implementation Testing
- [ ] **SSR/Hydration Test**: No server-side rendering errors
- [ ] **TypeScript Compliance**: No type errors in strict mode
- [ ] **Error Boundary Test**: Graceful error handling throughout
- [ ] **Performance Test**: No memory leaks or excessive re-renders

### 🧪 Environment Testing
- [ ] **Missing Env Vars**: App degrades gracefully without Supabase config
- [ ] **Development Mode**: Hot reload works correctly
- [ ] **Production Build**: Builds and runs without errors
- [ ] **Edge Cases**: Handles malformed data, network errors, etc.

---

## 6. COMMON PITFALLS TO AVOID

### ⚠️ Authentication Pitfalls
1. **Don't assume auth context is immediately available** - Always check loading states
2. **Don't mix server and client auth patterns** - Use appropriate client for each environment
3. **Don't ignore session refresh** - Implement proper token refresh logic
4. **Don't skip error handling** - Auth can fail in many ways

### ⚠️ Database & Query Pitfalls
1. **Don't forget RLS policies** - Data will be accessible to all users without them
2. **Don't hardcode user IDs** - Always use `auth.uid()` or context
3. **Don't skip foreign key constraints** - Prevents data integrity issues
4. **Don't ignore TypeScript types** - Types prevent runtime errors

### ⚠️ Cookie & State Pitfalls
1. **Don't ignore cookie domain/path conflicts** - Be specific about cookie scope
2. **Don't skip browser environment checks** - SSR will break without them
3. **Don't cache Supabase clients inappropriately** - Can cause stale auth state
4. **Don't forget cookie expiration handling** - Sessions can expire

### ⚠️ Migration Process Pitfalls
1. **Don't migrate all pages simultaneously** - Do one at a time, test thoroughly
2. **Don't skip the cleanup phase** - Old auth tokens will cause conflicts
3. **Don't ignore import path inconsistencies** - Will cause build failures
4. **Don't forget to update documentation** - Team needs to understand new patterns

---

## 7. POST-MIGRATION CLEANUP CHECKLIST

### 🧹 Code Cleanup
- [ ] **Remove localStorage fallbacks** - Clean out old storage dependencies
- [ ] **Update import statements** - Ensure consistent context paths throughout
- [ ] **Remove dead code** - Clean up unused localStorage utilities
- [ ] **Update TypeScript configs** - Ensure proper type checking

### 🧹 Infrastructure Cleanup
- [ ] **Clear development caches** - Remove stale Next.js/webpack caches
- [ ] **Update environment configs** - Remove old project references
- [ ] **Clean browser storage** - Clear development browser data
- [ ] **Update deployment configs** - Ensure production env vars are correct

### 🧹 Documentation Updates
- [ ] **Update README** - Reflect new Supabase architecture
- [ ] **Update setup instructions** - Include Supabase configuration steps
- [ ] **Document environment variables** - List all required Supabase env vars
- [ ] **Update team documentation** - Ensure team understands new patterns

### 🧹 Testing & Validation
- [ ] **Run full test suite** - Ensure all tests pass with new architecture
- [ ] **Performance testing** - Verify no performance regressions
- [ ] **Security audit** - Verify RLS policies and auth patterns
- [ ] **User acceptance testing** - Test with real user workflows

---

## 8. SUCCESS METRICS & VALIDATION

### ✅ Migration Complete When:

**Authentication Works Perfectly:**
- Multiple users can use app simultaneously without conflicts
- Users can log in from different devices and see their data
- No authentication errors or warnings in console
- Sessions persist correctly across browser restarts

**Technical Implementation Solid:**
- No SSR/hydration warnings or errors
- All pages load correctly for authenticated users
- Profile detection works immediately after login
- TypeScript compilation succeeds with no errors

**Data Isolation Verified:**
- Users only see their own data
- Database queries respect RLS policies
- No data leakage between user accounts
- CRUD operations work correctly for each user

**Performance & Reliability:**
- App loads quickly with Supabase backend
- No memory leaks or excessive re-renders
- Proper error handling for network issues
- Graceful degradation when Supabase unavailable

---

## 9. EMERGENCY TROUBLESHOOTING

### 🚨 If Auth Still Failing After Migration:

1. **Nuclear Reset Process:**
   ```bash
   # 1. Clear Next.js cache
   rm -rf .next

   # 2. Clear browser completely
   # - Open DevTools → Application → Clear Storage
   # - Use clear-auth.html tool
   # - Try fresh incognito window

   # 3. Verify environment
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Debug Auth State:**
   ```typescript
   // Add temporary debug logging
   console.log('Auth state:', { user, loading, error })
   console.log('Cookies:', document.cookie)
   console.log('Supabase session:', await supabase.auth.getSession())
   ```

3. **Check Database Directly:**
   ```sql
   -- Verify RLS policies
   SELECT * FROM auth.users WHERE id = 'user-id';
   SELECT * FROM user_profiles WHERE user_id = 'user-id';

   -- Test RLS enforcement
   SET ROLE authenticated;
   SET request.jwt.claim.sub TO 'user-id';
   SELECT * FROM user_profiles; -- Should only return user's profile
   ```

### 🚨 If SSR Errors Persist:

1. **Add Environment Checks Everywhere:**
   ```typescript
   const isBrowser = typeof window !== 'undefined'
   const hasDocument = typeof document !== 'undefined'

   if (hasDocument) {
     // Browser-only code
   }
   ```

2. **Use Dynamic Imports:**
   ```typescript
   const BrowserOnlyComponent = dynamic(
     () => import('./BrowserOnlyComponent'),
     { ssr: false }
   )
   ```

---

## 10. HANDOFF INSTRUCTIONS

### For the Next AI Assistant:

1. **Read this entire document first** - Don't skip sections
2. **Run the pre-migration assessment** - Identify issues before starting
3. **Follow the phased approach** - Don't try to do everything at once
4. **Test thoroughly at each step** - Catch issues early
5. **Use the nuclear cleanup tool** - When auth conflicts arise
6. **Reference the code patterns** - Don't reinvent solutions
7. **Update this document** - Add any new issues you discover

### Key Files to Focus On:
- `src/middleware.ts` - Server-side auth and cookie filtering
- `src/lib/supabase/client.ts` - Client-side Supabase configuration
- `src/lib/context/AuthContext.tsx` - Authentication state management
- `src/lib/context/ProfileContext.tsx` - Profile data management
- `clear-auth.html` - Nuclear cleanup tool for auth conflicts

### Most Critical Success Factors:
1. **Ruthless cookie filtering** - Only allow target project cookies
2. **Proper environment checks** - SSR compatibility everywhere
3. **One page at a time** - Don't rush the migration process
4. **Comprehensive testing** - Multi-user, cross-device, fresh browser

This guide represents hard-won knowledge from successfully completing a complex localStorage-to-Supabase migration. Follow it closely and you'll avoid the major pitfalls we encountered.

**Good luck! 🚀**