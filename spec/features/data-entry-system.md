# Data Entry System

## 1) Context (why this exists)
Users need to track their dating expenses, time spent, and outcomes (number of nuts) for each dating interaction to calculate performance metrics like cost per nut and efficiency.

## 2) User Journey (step-by-step)
- User clicks "Add Data" button from a girl's profile card or overview table
- User is taken to a dedicated Add Data page for that specific girl
- User enters the date of the interaction (defaults to today)
- User enters amount spent in dollars (required, must be positive number)
- User enters duration using separate hours and minutes fields
- User enters number of nuts achieved (required, must be positive integer)
- User clicks "Add Entry" to save the data
- Form validates all inputs and shows errors if invalid
- Entry is saved to localStorage with auto-generated ID and timestamps
- User sees success message and can add another entry or return to dashboard
- All metrics are automatically recalculated for the girl and globally

## 3) Technology (what it uses today)
**Files involved:**
- `app/girls/[id]/add-data/page.tsx`: Main data entry page
- `lib/storage.ts` (lines 93-167): CRUD operations for data entries
- `lib/context.tsx` (lines 235-273): React hooks for data entry management
- `lib/calculations.ts`: Real-time metric calculations
- `lib/types.ts` (lines 48-57): Data entry structure

**localStorage keys:**
- `cpn_data_entries`: Stores array of all data entries linked to girls by girlId

**Key functions:**
- `dataEntriesStorage.create()`: Creates new entry with UUID and timestamps
- `dataEntriesStorage.getByGirlId()`: Gets all entries for a specific girl
- `useDataEntries()` hook: Provides CRUD operations and filtered queries

## 4) Design Directions (what it looks/feels like)
- Full-page form layout with girl's name prominently displayed at top
- Large input fields optimized for mobile touch input
- Separate hours and minutes fields instead of single duration field
- Date picker defaults to current date but allows past dates
- Yellow save button consistent with app branding
- Success messaging with option to add another entry
- Form includes helpful placeholder text and input labels
- Real-time validation with error messages below each field

## Data We Store (plain-English "table idea")
- `id` (unique identifier, auto-generated UUID)
- `girlId` (foreign key linking to girl profile)
- `date` (date of the interaction)
- `amountSpent` (money spent in dollars, decimal number)
- `durationMinutes` (total time spent converted to minutes)
- `numberOfNuts` (count of nuts achieved, integer)
- `createdAt` (timestamp when entry was created)
- `updatedAt` (timestamp when entry was last modified)

## Who Can See What (safety/permissions in plain words)
- All data is stored locally on the user's device only
- No entries are shared with other users or sent to any server
- Users can only see and edit their own data entries
- Data entries are automatically filtered by the signed-in user's device

## Acceptance Criteria (done = true)
- User can create a data entry with date, amount, duration, and nut count
- Amount spent validation prevents negative numbers or invalid currency
- Duration fields accept hours and minutes separately and convert to total minutes
- Number of nuts validation prevents negative numbers or decimals
- Date field defaults to today but allows selection of past dates
- Entry appears immediately in girl's metrics and global statistics
- All related metrics (cost per nut, time per nut, etc.) update automatically
- Form shows clear error messages for invalid inputs
- User can add multiple entries in sequence without leaving the page
- All entry data persists across browser sessions via localStorage

## Open Questions / Assumptions
- Time is stored internally as total minutes but presented as hours/minutes for user friendliness
- Amount spent is stored as a decimal number to handle cents accurately
- Number of nuts is restricted to integers (no partial nuts)
- Entries are linked to girls by ID, so deleting a girl also deletes all their entries

## Code References
- Add data page: `app/girls/[id]/add-data/page.tsx`
- Storage operations: `lib/storage.ts:93-167`
- State management: `lib/context.tsx:235-273`
- Type definitions: `lib/types.ts:48-57`
- CRUD operations: `lib/storage.ts:119-166`
- Metric calculations: `lib/calculations.ts`