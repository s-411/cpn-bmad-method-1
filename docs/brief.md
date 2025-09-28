# Project Brief: CPN App - Supabase Architecture Migration

## Executive Summary

The CPN (Cost Per Nut) App is a consumer dating analytics platform that enables users to track dating expenses, time investment, and outcomes to optimize their dating performance through data-driven insights. This project involves rebuilding the app with Supabase backend architecture to support thousands of concurrent users across freemium and premium subscription tiers, while preserving all 40 validated features from the successful local storage prototype.

The app targets male users aged 18-35 seeking data-driven dating optimization, offering three tiers: Boyfriend mode (free), Player mode ($1.99/week), and Lifetime access ($27 one-time). The rebuild solves the critical data persistence and multi-device synchronization problems that caused the original Supabase migration failure.

## Problem Statement

**Current State:** The CPN app exists as a fully functional local storage prototype with excellent UX, complete onboarding flow, perfect design, and all 40 features working flawlessly. However, it's unusable as a consumer product because:

1. **Data Isolation:** Users lose all data when switching devices or browsers
2. **No Scalability:** Cannot support multiple users or prevent data mixing
3. **No Monetization:** Cannot implement subscription tiers or payment processing
4. **No User Management:** No authentication, account creation, or user sessions
5. **Previous Migration Disaster:** Initial Supabase conversion attempt resulted in complete system failure

**Business Impact:**
- Cannot launch to thousands of target users
- Cannot generate revenue through subscription model
- Cannot provide multi-device user experience
- Risk of repeating architectural mistakes that caused previous failure

**Why This Must Be Solved Now:**
- Validated product-market fit with working prototype
- Complete feature set already proven with users
- Opportunity cost of delayed launch to competitive market
- Need to monetize validated user demand

## Proposed Solution

**Database-First Architecture Approach:** Build Supabase backend infrastructure FIRST, then migrate features incrementally to prevent the catastrophic failure of the previous attempt.

**Core Solution Components:**
1. **Supabase Multi-Tenant Database:** Secure user data isolation with Row Level Security (RLS)
2. **Progressive Migration Strategy:** Rebuild features systematically with database integration from day one
3. **Onboarding Data Persistence:** Maintain user-entered data through signup/payment flow
4. **Subscription Integration:** Stripe payment processing with plan-based feature access
5. **Multi-Device Synchronization:** Real-time data sync across user devices

**Key Differentiators:**
- Proven UX/UI already validated and working
- Complete feature specification (40 features documented)
- Database-first approach prevents previous architectural failures
- Seamless onboarding with data persistence through payment flow

## Target Users

### Primary User Segment: Data-Driven Dating Optimizers
**Demographics:**
- Males aged 18-35
- Tech-savvy early adopters
- Mid to high disposable income ($50K+ annually)
- Urban/suburban locations with active dating scenes

**Current Behaviors:**
- Actively dating multiple people simultaneously
- Frustrated with dating ROI and lack of optimization insights
- Using spreadsheets or mental tracking for dating expenses
- Seeking competitive advantage in dating market

**Specific Needs:**
- Quantify dating performance with actionable metrics
- Track cost per outcome across different dating strategies
- Optimize time and money investment in dating
- Compare performance across different partners/approaches

**Goals:**
- Improve dating efficiency and success rates
- Reduce unnecessary dating expenses
- Data-driven decision making for dating strategy
- Achieve better outcomes with less investment

### Secondary User Segment: Premium Lifestyle Trackers
**Demographics:**
- Males aged 25-45
- High-income professionals and entrepreneurs
- Performance optimization mindset across life areas
- Willing to pay premium for quality tools

**Current Behaviors:**
- Use multiple apps for life optimization and tracking
- Invest in premium tools and services
- Share achievements and insights on social media
- Seek comprehensive analytics and insights

## Goals & Success Metrics

### Business Objectives
- **Revenue Target:** $50K MRR within 6 months of launch
- **User Acquisition:** 10,000 registered users in first year
- **Conversion Rate:** 15% free-to-paid conversion rate
- **Customer Retention:** 80% monthly retention for paid users
- **Churn Reduction:** <5% monthly churn for annual subscribers

### User Success Metrics
- **Onboarding Completion:** 85% complete full onboarding flow
- **Data Entry Engagement:** Users log average 3+ entries per week
- **Feature Adoption:** 70% of users utilize 5+ core features
- **Session Duration:** Average 8+ minutes per session
- **Return Usage:** 60% weekly active user rate

### Key Performance Indicators (KPIs)
- **Monthly Recurring Revenue (MRR):** Track subscription growth and revenue trends
- **Customer Acquisition Cost (CAC):** Optimize marketing spend efficiency
- **Lifetime Value (LTV):** Maximize user value through retention and upsells
- **Database Performance:** Sub-200ms query response times for all operations
- **System Uptime:** 99.9% availability for production environment

## MVP Scope

### Core Features (Must Have)
- **User Authentication & Profiles:** Supabase Auth with secure user registration, login, and profile management
- **Girl Profile Management:** Create, edit, manage dating profiles with demographics and ratings (Supabase integration)
- **Data Entry System:** Track expenses, time, outcomes with real-time metric calculations (database persistence)
- **Real-time Metrics Dashboard:** Cost per nut, efficiency metrics, performance analytics with live updates
- **Overview Dashboard:** Comprehensive sortable table view of all profiles and metrics
- **Subscription Management:** Stripe integration with three-tier pricing (Boyfriend/Player/Lifetime)
- **Onboarding Flow:** Multi-step guided setup with data persistence through payment process
- **Multi-Device Sync:** Real-time data synchronization across user devices
- **Row Level Security:** Complete data isolation between user accounts
- **Mobile-Responsive Design:** Preserve existing UI/UX with database backend

### Out of Scope for MVP
- Advanced analytics and trend analysis
- Social sharing features and custom image generation
- Achievement system and gamification
- Leaderboards and competitive features
- Affiliate program and referral tracking
- Data export/import functionality
- Theme customization beyond basic dark mode
- Advanced filtering and search capabilities

### MVP Success Criteria
- Users can complete full onboarding including payment without data loss
- All core features work seamlessly with Supabase backend
- Zero data mixing between user accounts
- Successful migration of all existing UI components to database architecture
- Sub-500ms page load times for all authenticated pages
- 100% feature parity with local storage prototype for core functionality

## Post-MVP Vision

### Phase 2 Features
- **Advanced Analytics:** Trend analysis, predictive insights, performance comparisons
- **Social Features:** Custom share image generator, privacy-controlled sharing
- **Enhanced UX:** Achievement system, advanced filtering, data export/import
- **Monetization:** Affiliate program, referral tracking, premium feature tiers

### Long-term Vision
Transform CPN into the leading platform for data-driven relationship optimization, expanding beyond dating to include relationship maintenance, social interaction tracking, and comprehensive lifestyle optimization tools.

### Expansion Opportunities
- Female-focused version with different metrics and insights
- Corporate team-building and social interaction analytics
- API platform for third-party dating app integrations
- AI-powered dating strategy recommendations
- International market expansion with localized features

## Technical Considerations

### Platform Requirements
- **Target Platforms:** Progressive Web App (PWA) optimized for mobile-first experience
- **Browser/OS Support:** Modern browsers (Chrome 90+, Safari 14+, Firefox 88+), iOS Safari, Android Chrome
- **Performance Requirements:** <2s initial load, <500ms navigation, offline capability for core features

### Technology Preferences
- **Frontend:** Next.js 14+ with TypeScript, React 18+, Tailwind CSS (preserve existing design system)
- **Backend:** Supabase (PostgreSQL, Auth, Real-time subscriptions, Row Level Security)
- **Database:** PostgreSQL with optimized schema for multi-tenant architecture
- **Hosting/Infrastructure:** Vercel for frontend, Supabase managed backend, Stripe for payments

### Architecture Considerations
- **Repository Structure:** Monorepo with clear separation of concerns (components, database, utils)
- **Service Architecture:** Serverless functions for business logic, Supabase for data and auth
- **Integration Requirements:** Stripe webhooks, Supabase real-time subscriptions, mobile PWA capabilities
- **Security/Compliance:** Row Level Security (RLS), encrypted data at rest, GDPR compliance, PCI DSS for payments

## Constraints & Assumptions

### Constraints
- **Budget:** Bootstrap/self-funded project requiring cost-efficient solutions
- **Timeline:** 12-week development window to market launch
- **Resources:** Solo developer with design/business analyst support
- **Technical:** Must preserve existing UI/UX exactly, cannot afford redesign delays

### Key Assumptions
- Existing UI components can be adapted to Supabase data flows without major changes
- Supabase can handle projected user load (10K users, 100K+ database records)
- Stripe integration complexity is manageable within timeline constraints
- Row Level Security provides sufficient data isolation for multi-tenant architecture
- Current feature set remains viable for target market validation
- Database-first approach will prevent previous migration failure scenarios

## Risks & Open Questions

### Key Risks
- **Migration Complexity:** Risk of repeating previous Supabase integration failures that caused system breakdown
- **Data Architecture:** Potential performance issues with complex relational queries for analytics
- **User Experience:** Risk of degraded performance compared to local storage responsiveness
- **Subscription Complexity:** Stripe integration may introduce payment flow complications affecting onboarding

### Open Questions
- How to maintain onboarding data persistence through payment flow without user accounts?
- What's the optimal database schema for girl profiles and data entries with proper indexing?
- How to handle real-time updates for analytics calculations without performance degradation?
- What's the migration strategy for existing local storage users to Supabase accounts?
- How to implement Row Level Security policies for complex data relationships?

### Areas Needing Further Research
- Supabase performance benchmarks for projected user load and data volume
- Optimal database indexing strategy for real-time metrics calculations
- Stripe webhook reliability and failure handling for subscription management
- PWA implementation best practices for offline-first user experience
- User onboarding analytics to optimize conversion through payment flow

## Appendices

### A. Research Summary
**Market Research Findings:**
- Validated demand through working prototype user testing
- Dating optimization market growing with data-driven consumer trends
- Limited direct competition in comprehensive dating analytics space

**Technical Feasibility Studies:**
- Supabase capable of handling projected scale and feature requirements
- All 40 existing features technically feasible with database backend
- Stripe integration well-documented for subscription management

### B. Stakeholder Input
**Developer/Founder Feedback:**
- Critical requirement: prevent repetition of previous migration failure
- Must maintain exact UI/UX to preserve validated user experience
- Database-first approach essential for architectural stability

### C. References
- [CPN Features Index](spec/FEATURES-INDEX.md)
- [Detailed Feature Specifications](spec/features/)
- [Existing App Structure](app/)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs)

## Next Steps

### Immediate Actions
1. **Database Schema Design:** Create comprehensive Supabase schema for users, profiles, data entries, subscriptions
2. **Row Level Security Implementation:** Design and test RLS policies for complete data isolation
3. **Authentication Flow Setup:** Implement Supabase Auth with user registration and login
4. **Stripe Integration Planning:** Design subscription management and payment flow architecture
5. **Development Environment Setup:** Configure Supabase project, environment variables, and deployment pipeline
6. **Feature Migration Roadmap:** Prioritize which of the 40 features to migrate first for MVP

### PM Handoff
This Project Brief provides the full context for the CPN App Supabase migration. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements. The critical success factor is preventing the architectural failures that occurred in the previous Supabase migration attempt while preserving all validated features and user experience.