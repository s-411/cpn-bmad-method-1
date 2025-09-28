# Overview Dashboard

## 1) Context (why this exists)
Users need a comprehensive spreadsheet-style view of all their dating profiles with sortable metrics to analyze performance and make data-driven decisions.

## 2) User Journey (step-by-step)
- User clicks "Overview" in the navigation (table icon)
- User sees all girl profiles in a sortable table format (desktop) or card layout (mobile)
- User can click column headers to sort by any metric (ascending/descending)
- User can toggle active/inactive status for any girl with a switch
- User clicks "Add Data" to go directly to data entry for that girl
- User clicks edit icon to modify girl's profile information
- User clicks delete icon to remove girl (with confirmation modal)
- On mobile, user sees card-based layout with expandable "More metrics" section
- User can add new girls directly from the overview page
- All metrics update in real-time as user makes changes

## 3) Technology (what it uses today)
**Files involved:**
- `app/overview/page.tsx` (lines 1-380): Main overview page with table and cards
- `lib/calculations.ts`: Metric calculations and sorting functions
- `lib/types.ts` (lines 90-93): SortConfig interface for table sorting
- `components/modals/EditGirlModal.tsx`: Profile editing modal
- `components/modals/DeleteWarningModal.tsx`: Deletion confirmation

**Key functions:**
- `sortGirlsByField()`: Sorts array of girls by specified field and direction
- `handleSort()`: Updates sort configuration and triggers re-sort
- `SortButton` component: Displays sortable column headers with direction indicators
- Responsive design switches between table (desktop) and cards (mobile)

**Displayed metrics:**
- Name, Status, Rating, Total Nuts, Total Spent, Cost per Nut
- Total Time, Time per Nut, Cost per Hour, Nuts per Hour
- Add Data button, Edit/Delete actions

## 4) Design Directions (what it looks/feels like)
- Desktop: Professional spreadsheet-style table with hover effects
- Mobile: Card-based layout with progressive disclosure for additional metrics
- Sortable column headers with up/down arrow indicators
- Active/inactive toggle switches with green/gray color coding
- Yellow "Add Data" buttons as primary call-to-action
- Edit/delete icons in muted gray with hover effects
- Expandable "More metrics" section on mobile to reduce cognitive load
- Consistent spacing and typography throughout

## Data We Store (plain-English "table idea")
**Table displays (no additional storage):**
- All girl profile data plus calculated metrics
- Sort configuration (field and direction)
- Current filter states (active/inactive)

**UI state:**
- `sortConfig`: Object tracking current sort field and direction
- `editingGirl`: Currently selected girl for editing (or null)
- `deletingGirl`: Currently selected girl for deletion (or null)
- Modal open/closed states

## Who Can See What (safety/permissions in plain words)
- Users see only their own girl profiles and calculated metrics
- All data displayed is from the user's local storage
- No data is shared with other users or external services
- Sorting and filtering happen entirely on the client side

## Acceptance Criteria (done = true)
- Table displays all girls with complete metrics in sortable columns
- Clicking column headers sorts data ascending/descending with visual indicators
- Active/inactive toggle switches work and immediately update girl status
- "Add Data" buttons navigate to correct data entry page for each girl
- Edit icons open populated modal with girl's current information
- Delete icons show confirmation modal with option to deactivate instead
- Mobile layout shows condensed cards with expandable additional metrics
- All metrics display with proper formatting (currency, time, ratings)
- Empty state shows helpful message when no girls exist
- Real-time updates when underlying data changes
- Responsive design works smoothly between desktop and mobile breakpoints

## Open Questions / Assumptions
- Sort state is not persisted across page refreshes
- Nuts per Hour is calculated client-side as (totalNuts / (totalTime / 60))
- Active/inactive status affects whether girls appear in some analytics
- Delete confirmation offers "make inactive" as alternative to permanent deletion
- Table scrolls horizontally on smaller screens to show all columns

## Code References
- Main overview page: `app/overview/page.tsx:20-380`
- Sorting logic: `app/overview/page.tsx:31-56`
- Desktop table: `app/overview/page.tsx:128-254`
- Mobile cards: `app/overview/page.tsx:255-350`
- Sort button component: `app/overview/page.tsx:58-77`
- Responsive design breakpoints: `app/overview/page.tsx:128-129, 255-256`