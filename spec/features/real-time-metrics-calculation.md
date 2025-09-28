# Real-time Metrics Calculation

## 1) Context (why this exists)
Users need automatic calculation of performance metrics (cost per nut, time efficiency, ROI, etc.) that update instantly whenever they add or modify data entries.

## 2) User Journey (step-by-step)
- User adds a new data entry for any girl
- All metrics automatically recalculate and update across the entire app
- User sees updated cost per nut, time per nut, and cost per hour values
- Global statistics update to reflect the new data
- All charts and analytics refresh with new calculations
- Changes appear immediately without page refresh or manual refresh
- Derived metrics like nuts per hour and efficiency scores update automatically
- Overview table shows updated values in real-time

## 3) Technology (what it uses today)
**Files involved:**
- `lib/calculations.ts`: Core calculation functions for all metrics
- `lib/context.tsx` (lines 42-51): Real-time calculation integration
- `lib/types.ts` (lines 95-119): Interfaces for calculated metrics
- All page components: Consume calculated metrics via React context

**Key functions:**
- `createGirlWithMetrics()`: Calculates all metrics for a single girl
- `calculateGlobalStats()`: Aggregates metrics across all girls and entries
- `calculateDerivedData()`: Orchestrates real-time recalculation
- `formatCurrency()`, `formatTime()`, `formatRating()`: Display formatting

**Calculation formulas:**
- Cost per Nut = Total Spent ÷ Total Nuts
- Time per Nut = Total Time ÷ Total Nuts (in minutes)
- Cost per Hour = Total Spent ÷ (Total Time ÷ 60)
- Nuts per Hour = Total Nuts ÷ (Total Time ÷ 60)

## 4) Design Directions (what it looks/feels like)
- All calculated values appear instantly without loading indicators
- Metrics display with appropriate precision (2 decimal places for currency)
- Color coding: yellow for cost metrics, white for counts and time
- Consistent formatting across all pages and components
- Zero states handled gracefully (show 0 instead of NaN or infinity)
- Large numbers formatted with commas for readability

## Data We Store (plain-English "table idea")
**Individual girl metrics:**
- `totalSpent`: Sum of all amountSpent values for this girl
- `totalNuts`: Sum of all numberOfNuts values for this girl
- `totalTime`: Sum of all durationMinutes values for this girl
- `costPerNut`: totalSpent divided by totalNuts
- `timePerNut`: totalTime divided by totalNuts (in minutes)
- `costPerHour`: totalSpent divided by totalTime in hours

**Global aggregated metrics:**
- `totalGirls`: Count of all girl profiles
- `activeGirls`: Count of girls with at least one data entry
- `totalSpent`: Sum of all expenses across all girls
- `totalNuts`: Sum of all nuts across all girls
- `totalTime`: Sum of all time across all girls
- `averageRating`: Average rating across all girl profiles

## Who Can See What (safety/permissions in plain words)
- All calculations happen locally on the user's device
- No metric data is sent to external servers or shared with others
- Users see only their own calculated metrics
- Calculations are performed in real-time using only the user's data

## Acceptance Criteria (done = true)
- Adding a new data entry immediately updates all related metrics
- Editing an existing entry recalculates affected metrics instantly
- Deleting an entry removes its contribution from all calculations
- All metric displays show consistent formatting and precision
- Zero division cases (no nuts or no time) display 0 instead of errors
- Global statistics aggregate correctly across all girls and entries
- Calculations remain accurate even with very large or very small numbers
- Performance remains smooth even with hundreds of data entries
- All pages and components show the same calculated values simultaneously
- Metrics update correctly when girls are activated/deactivated

## Open Questions / Assumptions
- Calculations assume all monetary values are in the same currency
- Time calculations assume all durations are stored consistently in minutes
- Division by zero scenarios default to zero rather than showing "N/A"
- Very large numbers may lose precision due to JavaScript's number limitations
- Metrics are calculated on every state change rather than cached

## Code References
- Core calculations: `lib/calculations.ts`
- Real-time updates: `lib/context.tsx:42-51`
- Metric interfaces: `lib/types.ts:95-119`
- Girl metrics creation: `lib/calculations.ts` (createGirlWithMetrics function)
- Global stats calculation: `lib/calculations.ts` (calculateGlobalStats function)
- Display formatting: `lib/calculations.ts` (format functions)