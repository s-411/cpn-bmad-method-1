# User Settings Management

## 1) Context (why this exists)
Users need to customize their app experience with personal preferences for display, privacy, notifications, and data handling.

## 2) User Journey (step-by-step)
- User navigates to Settings page from main navigation
- User sees tabbed interface with different setting categories
- User can update display name and profile information
- User can choose theme variations (dark, darker, midnight) and accent colors
- User can set date/time formats and week start preferences
- User can configure privacy settings for sharing and visibility
- User can enable/disable various notification types
- Settings save automatically as user makes changes
- User can export all their data as JSON backup
- User can import previously exported data
- User can view current storage usage and clear all data

## 3) Technology (what it uses today)
**Files involved:**
- `app/settings/page.tsx` (lines 1-181): Main settings interface
- `lib/settings-context.tsx` (lines 1-290): Settings state management and persistence
- `lib/storage.ts` (lines 192-216): Data export/import utilities

**localStorage keys:**
- `cpn_user_profile`: Display name, avatar, account dates
- `cpn_theme_settings`: Theme, accent color, compact mode, animations
- `cpn_datetime_settings`: Date format, time format, week start day
- `cpn_privacy_settings`: Sharing preferences, visibility controls
- `cpn_notification_settings`: Email and push notification preferences

**Key functions:**
- `useSettings()`: Hook providing all settings and update functions
- `updateProfile()`, `updateTheme()`, etc.: Individual setting category updaters
- `exportData()`: Creates downloadable JSON backup of all user data
- `importData()`: Validates and restores data from backup file

## 4) Design Directions (what it looks/feels like)
- Tabbed interface separating different types of settings
- Toggle switches for boolean preferences (active/inactive states)
- Dropdown selectors for enumerated options (theme, date format)
- Text inputs for display name and customizable values
- Export/import buttons with file download and upload functionality
- Storage usage display with human-readable file sizes
- Consistent styling with app's dark theme and yellow accents

## Data We Store (plain-English "table idea")
**User profile:**
- `displayName`: How the user's name appears in the app
- `avatarUrl`: Profile picture or emoji representation
- `accountCreated`: When the user first started using the app
- `lastLogin`: Most recent app usage timestamp

**Theme settings:**
- `theme`: Visual theme variant (dark, darker, midnight)
- `accentColor`: Primary accent color (yellow, blue, green, red)
- `compactMode`: Whether to use condensed layouts
- `animationsEnabled`: Whether to show UI animations

**Date/time preferences:**
- `dateFormat`: How dates are displayed (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- `timeFormat`: 12-hour or 24-hour time display
- `weekStart`: Whether weeks start on Sunday or Monday

**Privacy controls:**
- `leaderboardVisibility`: Who can see user in leaderboards (public, friends, private)
- `showRealName`: Whether to display real name vs username
- `shareAchievements`: Whether achievements can be shared
- `anonymousMode`: Whether to anonymize all shared data

## Who Can See What (safety/permissions in plain words)
- All settings are stored locally on the user's device
- No settings data is shared with other users or external services
- Privacy settings control what information appears in shared content
- Users have complete control over their data with export/import functionality

## Acceptance Criteria (done = true)
- Settings save automatically when changed without requiring a save button
- All setting categories (profile, theme, datetime, privacy, notifications) work correctly
- Theme changes take effect immediately throughout the app
- Date/time format changes update displays across all pages
- Export function downloads valid JSON file with all user data and settings
- Import function validates uploaded files and restores data correctly
- Storage usage calculation shows accurate file size information
- Privacy settings affect what data appears in shared content
- Settings persist across browser sessions and app restarts
- Invalid imported data is rejected with helpful error messages

## Open Questions / Assumptions
- Avatar support is limited to emoji/text rather than image uploads
- Theme variants are predefined rather than allowing custom color schemes
- Export files include all user data, not just settings
- Import completely replaces existing data rather than merging
- Some settings (like animations) may not be fully implemented throughout the app

## Code References
- Settings page: `app/settings/page.tsx:20-181`
- Settings context: `lib/settings-context.tsx:115-290`
- Storage utilities: `lib/storage.ts:192-216`
- Theme management: `lib/settings-context.tsx:69-100`
- Data export/import: `app/settings/page.tsx:150-181`