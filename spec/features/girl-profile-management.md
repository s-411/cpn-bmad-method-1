# Girl Profile Management

## 1) Context (why this exists)
Users need to create and manage dating profiles to track their dating expenses and performance metrics across different people they're dating.

## 2) User Journey (step-by-step)
- User clicks "Add New Girl" button on the Girls Dashboard
- A modal opens with a multi-step form
- User enters name (required) and age (minimum 18, required)
- User selects ethnicity from dropdown (optional, defaults to "Prefer not to say")
- User selects hair color from dropdown (optional)
- User enters location (city and country, both optional)
- User selects hotness rating using tile-based selector (5.0-10.0 in 0.5 increments, default 6.0)
- User clicks "Add Girl" to save the profile
- Form validates all inputs and shows errors if invalid
- Profile is saved to localStorage and user is redirected to Add Data page for the new profile
- Profile appears in Girls Dashboard grid and can be edited later

## 3) Technology (what it uses today)
**Files involved:**
- `components/modals/AddGirlModal.tsx` (lines 1-323): Main form component with validation
- `components/modals/EditGirlModal.tsx`: Edit existing profiles
- `lib/storage.ts` (lines 29-90): CRUD operations for girl profiles
- `lib/context.tsx` (lines 191-233): React hooks for profile management
- `lib/types.ts` (lines 30-43): Girl profile data structure

**localStorage keys:**
- `cpn_girls`: Stores array of all girl profiles with automatic JSON serialization

**Key functions:**
- `girlsStorage.create()`: Creates new profile with auto-generated UUID
- `girlsStorage.update()`: Updates existing profile
- `useGirls()` hook: Provides CRUD operations and real-time state

## 4) Design Directions (what it looks/feels like)
- Modal overlay with dark background and slide-up animation
- Two-row rating selector (5.0-7.5 in first row, 8.0-10.0 in second row)
- Yellow accent color for selected ratings and save button
- Tile-based rating system with visual feedback on hover and selection
- Form includes helper text explaining optional fields
- Real-time validation with red error messages below invalid fields
- Clean typography using National2Condensed headings and ESKlarheit body text

## Data We Store (plain-English "table idea")
- `id` (unique identifier, auto-generated UUID)
- `name` (display name of the person)
- `age` (must be 18 or older)
- `nationality` (text field, kept for backward compatibility)
- `rating` (hotness rating from 5.0 to 10.0 in 0.5 increments)
- `isActive` (whether this profile is currently active/inactive)
- `ethnicity` (optional structured dropdown selection)
- `hairColor` (optional structured dropdown selection)
- `location` (optional object with city and country fields)
- `createdAt` (timestamp when profile was created)
- `updatedAt` (timestamp when profile was last modified)

## Who Can See What (safety/permissions in plain words)
- All data is stored locally on the user's device only
- No profiles are shared with other users or sent to any server
- Users can only see and edit their own profiles
- Sharing features use privacy controls to filter sensitive information

## Acceptance Criteria (done = true)
- User can create a new profile with just name and age (minimum required fields)
- Age validation prevents profiles under 18 years old
- Rating selector works with mouse/touch and shows visual feedback
- Optional demographic fields can be left blank without errors
- Profile appears immediately in Girls Dashboard after saving
- User is automatically redirected to Add Data page after creating profile
- Edit modal pre-fills all existing data and saves changes correctly
- Profile active/inactive status can be toggled from the Girls Dashboard
- Form validation shows clear error messages for invalid inputs
- All profile data persists across browser sessions via localStorage

## Open Questions / Assumptions
- The rating system assumes a 5.0-10.0 scale rather than traditional 1-10
- Ethnicity and hair color are stored as structured data for analytics but also sync to nationality field for backward compatibility
- Location data is stored as separate city/country fields rather than a single address string

## Code References
- Main modal component: `components/modals/AddGirlModal.tsx:14-322`
- Storage operations: `lib/storage.ts:29-90`
- State management: `lib/context.tsx:191-233`
- Type definitions: `lib/types.ts:30-43`
- Form validation: `AddGirlModal.tsx:31-51`
- Rating selector: `AddGirlModal.tsx:263-295`