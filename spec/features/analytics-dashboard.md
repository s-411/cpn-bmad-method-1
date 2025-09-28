# Analytics Dashboard

## 1) Context (why this exists)
Users need visual charts and insights to understand their dating performance trends, compare different girls, and identify patterns in their spending and time allocation.

## 2) User Journey (step-by-step)
- User navigates to Analytics page from main navigation
- User sees time range filter (7 days, 30 days, 90 days, all time)
- User views overview tiles showing key aggregate metrics
- User scrolls through various charts showing different data perspectives
- User sees color-coded legend mapping each girl to a consistent color across charts
- User can hover over chart elements to see detailed tooltips with exact values
- User can filter data by time range to see trends over specific periods
- User views performance insights showing best/worst performers
- User can share analytics data using integrated share button

## 3) Technology (what it uses today)
**Files involved:**
- `app/analytics/page.tsx` (lines 1-861): Main analytics page with all charts
- `lib/calculations.ts`: Advanced analytics calculation functions
- `lib/colors.ts`: Consistent color assignment for girls across charts
- `components/sharing/ShareButton.tsx`: Analytics sharing integration

**Chart libraries:**
- Recharts library for all chart components (Bar, Line, Pie, Scatter)
- ResponsiveContainer for automatic resizing
- Custom tooltip components for enhanced data display

**Key calculations:**
- `getMonthlyTrends()`: Monthly spending patterns over time
- `getCostEfficiencyTrends()`: Cost per nut trends by month
- `getSpendingDistribution()`: Percentage breakdown of spending by girl
- `getEfficiencyRatingCorrelation()`: Scatter plot data for rating vs efficiency
- `getROIRanking()`: Performance ranking with efficiency scores

## 4) Design Directions (what it looks/feels like)
- Grid layout with cards containing individual charts
- Consistent color mapping ensures same girl has same color across all charts
- Dark theme with yellow accent colors matching app branding
- Performance insights section with emoji icons and top performer highlights
- Responsive design adapts chart sizes for mobile and desktop
- Custom tooltips show formatted currency, time, and percentage values
- Loading states and empty states for charts with no data

## Data We Store (plain-English "table idea")
**Analytics state (temporary, not persisted):**
- `timeRange`: Currently selected time filter (7, 30, 90 days, or all)
- `filteredEntries`: Data entries within the selected time range
- `activeGirls`: Girls who have data entries and are marked active

**Chart data (calculated in real-time):**
- Monthly spending trends with dates and amounts
- Cost efficiency trends showing cost per nut over time
- Spending distribution percentages by girl
- Rating vs efficiency correlation for scatter plots
- ROI ranking with calculated efficiency scores

**Color assignments:**
- Consistent color mapping for each girl across all charts
- Color persistence within single session

## Who Can See What (safety/permissions in plain words)
- Users see only their own analytics data
- All calculations happen locally on the user's device
- No analytics data is sent to external services
- Time filtering and chart generation happen client-side only

## Acceptance Criteria (done = true)
- Time range filter correctly filters data entries and updates all charts
- All charts display with consistent color coding for each girl
- Hover tooltips show properly formatted values (currency, time, percentages)
- Charts are responsive and resize appropriately on different screen sizes
- Empty state appears when no data exists for selected time range
- Performance insights section shows accurate top performers
- Monthly trends chart appears only when multiple months of data exist
- Scatter plot shows correlation between rating and efficiency accurately
- ROI ranking table sorts girls by calculated efficiency scores
- Share button generates shareable analytics summary

## Open Questions / Assumptions
- Color assignments are session-based and may change between visits
- Charts automatically hide when insufficient data exists for meaningful display
- Efficiency scores are calculated using a proprietary formula combining multiple metrics
- Some advanced charts (scatter plot, efficiency trends) require minimum data thresholds
- Time filtering affects all charts simultaneously rather than individually

## Code References
- Main analytics page: `app/analytics/page.tsx:36-861`
- Time filtering: `app/analytics/page.tsx:42-50`
- Chart components: `app/analytics/page.tsx:360-820`
- Color management: `lib/colors.ts` + `app/analytics/page.tsx:63`
- Custom tooltips: `app/analytics/page.tsx:143-163`
- Performance insights: `app/analytics/page.tsx:288-333`