# Local Storage System

## 1) Context (why this exists)
The app needs to persist user data locally on their device without requiring a backend server, providing privacy and offline functionality while maintaining data across browser sessions.

## 2) User Journey (step-by-step)
- User opens the app for the first time and sees template demo data
- User creates their first girl profile, which automatically replaces template data
- All user actions (adding girls, data entries, settings changes) save automatically
- User closes and reopens browser - all their data is still there
- User can export their data as JSON for backup purposes
- User can import previously exported data to restore their information
- User can clear all data to start fresh (with confirmation)
- Storage usage is monitored and displayed in settings

## 3) Technology (what it uses today)
**Files involved:**
- `lib/storage.ts` (lines 1-216): Core CRUD operations and utilities
- `lib/context.tsx` (lines 156-173): Data loading and persistence
- `lib/settings-context.tsx` (lines 124-213): Settings persistence
- `lib/share/ShareContext.tsx` (lines 162-180): Share preferences storage
- `lib/achievements/AchievementService.ts` (lines 368-393): Achievement data storage

**localStorage keys used:**
- `cpn_girls`: Array of girl profiles
- `cpn_data_entries`: Array of data entries
- `cpn_user_profile`: User profile and display settings
- `cpn_theme_settings`: Theme and appearance preferences
- `cpn_datetime_settings`: Date and time format preferences
- `cpn_privacy_settings`: Privacy and sharing preferences
- `cpn_notification_settings`: Notification preferences
- `cpn-share-preferences`: Sharing feature preferences
- `cpn-share-history`: History of shared content
- `cpn-user-achievements`: User achievement progress

**Key functions:**
- `safeParseJSON()`: Safely handles JSON parsing with error recovery
- `storageUtils.exportData()`: Creates backup of all user data
- `storageUtils.importData()`: Restores data from backup
- `storageUtils.getStorageSize()`: Calculates total storage usage

## 4) Design Directions (what it looks/feels like)
- Data saves automatically with no "save" buttons needed
- Loading states appear briefly when reading from localStorage
- Template data provides realistic demo content for new users
- Export function downloads JSON file with timestamp
- Import function validates data structure before replacing
- Storage size shown in human-readable format (B, KB, MB)
- Error handling gracefully falls back to defaults if data is corrupted

## Data We Store (plain-English "table idea")
**Core app data:**
- Girl profiles with all demographic and rating information
- Data entries with dates, expenses, time, and outcomes
- User settings for theme, privacy, notifications, and preferences

**System data:**
- Achievement progress and unlocked badges
- Share history and preferences
- Migration flags to handle data structure updates
- Template data flags to track when user transitions to real data

**Metadata:**
- Creation and update timestamps for all records
- Storage size calculations and monitoring
- Error recovery information

## Who Can See What (safety/permissions in plain words)
- All data stays on the user's device and never leaves their browser
- No data is sent to any servers or shared with other users
- Users have complete control over their data with export/import functions
- Clearing browser data will delete all app data permanently
- Different browser profiles/incognito mode have separate data stores

## Acceptance Criteria (done = true)
- All user actions save automatically without explicit save commands
- Data persists correctly across browser sessions and computer restarts
- Template data is shown to new users and replaced when they add real data
- Export function creates valid JSON file with all user data
- Import function validates and restores data from exported files
- Storage size is calculated and displayed accurately
- Corrupted localStorage gracefully falls back to empty state
- Data migration system handles changes to data structure over time
- Multiple localStorage keys are managed independently
- Safe JSON parsing prevents crashes from malformed data

## Open Questions / Assumptions
- localStorage size limits vary by browser but generally support several MB
- Date objects are serialized as ISO strings and parsed back correctly
- Template data is hardcoded and not configurable by users
- No automatic backup to cloud services - users must manually export
- Browser's localStorage clearing affects all app data

## Code References
- Main storage operations: `lib/storage.ts:29-166`
- Storage utilities: `lib/storage.ts:170-216`
- Context integration: `lib/context.tsx:156-173`
- Settings persistence: `lib/settings-context.tsx:175-213`
- Safe JSON parsing: `lib/storage.ts:8-26`
- Export/import functions: `lib/storage.ts:192-205`