# CPN App Features Index

This document provides a comprehensive list of all features found in the CPN (Cost Per Nut) application. Each feature is documented with its own detailed specification file.

## Core Data Management Features

1. **Girl Profile Management** - Create, edit, and manage dating profiles with ratings and demographics
2. **Data Entry System** - Track expenses, time, and outcomes for each dating interaction
3. **Real-time Metrics Calculation** - Automatically calculate cost per nut, time efficiency, and other performance metrics
4. **Overview Dashboard** - Comprehensive tabular view of all profiles with sortable metrics
5. **Analytics Dashboard** - Charts and insights showing trends, comparisons, and performance analytics

## Sharing & Social Features

6. **Custom Share Image Generator** - Create Instagram Story-sized images with selected metrics
7. **Share Button Components** - Integrated sharing options throughout the app
8. **Share History Tracking** - Keep track of previously generated and shared content
9. **Privacy Controls** - Configurable data anonymization and filtering for shared content

## User Interface Features

10. **Girls Dashboard** - Grid view of profile cards with quick actions
11. **Mobile Navigation** - Bottom navigation bar optimized for mobile devices
12. **Sidebar Navigation** - Desktop sidebar with page navigation and active states
13. **Modal System** - Consistent modal components for forms and confirmations
14. **Rating Selector** - Tile-based hotness rating system (5.0-10.0 in 0.5 increments)

## Settings & Personalization

15. **User Settings Management** - Profile, theme, date/time, privacy, and notification preferences
16. **Theme System** - Dark theme with customizable accent colors and layout options
17. **Data Export/Import** - Backup and restore user data functionality
18. **Template Data System** - Demo data for new users and testing

## Data Storage & Persistence

19. **Local Storage System** - Client-side data persistence using localStorage
20. **Data Migration System** - Automatic data structure updates and backwards compatibility
21. **Storage Size Monitoring** - Track and display localStorage usage
22. **Achievement System** - Track and display user achievements and milestones

## Onboarding & User Flow

23. **Multi-step Onboarding** - Guided setup flow for new users
24. **Empty State Handling** - Helpful messaging and CTAs when no data exists
25. **Form Validation** - Real-time validation with error handling across all forms
26. **Auto-redirect Logic** - Smart navigation after completing actions

## Advanced Features

27. **Global Statistics** - Aggregate metrics across all profiles and entries
28. **Sorting & Filtering** - Sortable tables and filterable data views
29. **Responsive Design** - Mobile-first design with desktop enhancements
30. **Error Handling** - Comprehensive error states and user feedback
31. **Loading States** - Smooth loading indicators and skeleton screens

## Future/Placeholder Features

32. **Leaderboards System** - Competitive features with ranking and groups (UI only)
33. **Subscription Management** - Billing and payment features (UI only)
34. **Affiliate Program** - Referral tracking and commission system (framework only)
35. **Data Vault Analytics** - Advanced demographic analysis and insights (basic implementation)

## Technical Infrastructure

36. **Component Architecture** - Reusable UI components with consistent design system
37. **Type Safety** - Comprehensive TypeScript interfaces and type definitions
38. **Context State Management** - React Context with useReducer for global state
39. **Custom Hooks** - Specialized hooks for data operations and UI state
40. **Calculation Engine** - Business logic for all metric computations

---

**Total Features Identified: 40**

Each feature has been analyzed and documented with its own specification file in the `spec/features/` directory, including user journeys, technical implementation, data requirements, and acceptance criteria.