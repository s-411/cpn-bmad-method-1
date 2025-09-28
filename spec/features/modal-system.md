# Modal System

## 1) Context (why this exists)
The app needs consistent modal dialogs for forms, confirmations, and detail views that work across desktop and mobile with proper accessibility and user experience.

## 2) User Journey (step-by-step)
- User clicks a button that opens a modal (Add Girl, Edit Girl, Delete Confirmation)
- Modal appears with backdrop overlay and slide-up animation
- User can interact with modal content (forms, buttons, etc.)
- User can close modal by clicking X button, clicking backdrop, or pressing Escape key
- Modal disappears with animation and returns focus to trigger element
- Background content is prevented from scrolling while modal is open
- Form modals validate input and show errors before allowing submission
- Confirmation modals provide clear options and consequences

## 3) Technology (what it uses today)
**Files involved:**
- `components/modals/AddGirlModal.tsx` (lines 1-323): New girl profile creation
- `components/modals/EditGirlModal.tsx`: Edit existing girl profiles
- `components/modals/DeleteWarningModal.tsx`: Deletion confirmation with alternatives
- `components/modals/` directory: All modal components

**Modal patterns:**
- Fixed positioning with z-index for overlay
- Backdrop click detection for closing
- Escape key listener for keyboard accessibility
- Body scroll prevention when modal is open
- Consistent animations and transitions

**Common features:**
- Backdrop overlay with blur effect
- Slide-up animation for modal appearance
- X button in top-right corner for closing
- Form validation with error display
- Loading states during submission

## 4) Design Directions (what it looks/feels like)
- Dark backdrop with blur effect for visual separation
- White/light content area with rounded corners
- Slide-up animation from bottom on mobile, center on desktop
- Yellow accent colors for primary actions (save, confirm)
- Gray/muted colors for secondary actions (cancel, close)
- Clear visual hierarchy with proper spacing and typography
- Loading indicators during form submission or processing

## Data We Store (plain-English "table idea")
**Modal state (temporary UI state only):**
- `isOpen`: Whether each modal is currently visible
- `editingGirl`: Selected girl for editing (or null)
- `deletingGirl`: Selected girl for deletion (or null)
- Form field values during editing
- Validation error states for form fields
- Loading/submitting states

**No persistent storage - all modal data is temporary UI state**

## Who Can See What (safety/permissions in plain words)
- Modal content shows only the user's own data
- No modal data is shared with other users or external services
- Form submissions update the user's local data only
- Modal interactions are private to the current browser session

## Acceptance Criteria (done = true)
- Modals open with smooth slide-up animation from bottom
- Clicking backdrop closes modal without submitting forms
- Escape key closes modal from any focused element within
- Background scrolling is prevented when modal is open
- X button in corner provides clear close action
- Form validation shows errors inline below relevant fields
- Submit buttons show loading state during processing
- Modal content is keyboard accessible and properly focused
- Multiple modals can exist but only one displays at a time
- Modal positioning works correctly on all screen sizes
- Success/error states are clearly communicated to users

## Open Questions / Assumptions
- Modal z-index is high enough to appear above all other content
- Focus management returns to trigger element when modal closes
- Form data is not persisted if user closes modal without saving
- Modal animations use CSS transitions rather than JavaScript
- Screen readers can properly navigate modal content

## Code References
- Add girl modal: `components/modals/AddGirlModal.tsx:107-322`
- Edit modal pattern: `components/modals/EditGirlModal.tsx`
- Delete confirmation: `components/modals/DeleteWarningModal.tsx`
- Modal backdrop: Common pattern in all modal files around lines 108-113
- Form validation: `AddGirlModal.tsx:31-51`
- Animation classes: Referenced in `app/globals.css`