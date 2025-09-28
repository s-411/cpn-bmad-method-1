# Custom Share Image Generator

## 1) Context (why this exists)
Users want to share their dating performance metrics on social media in an attractive, privacy-controlled way that generates engagement and showcases their results.

## 2) User Journey (step-by-step)
- User navigates to the Share Center page
- User sees available metrics categorized by type (financial, efficiency, volume, time, quality, highlight)
- User selects 1-3 metrics they want to include on their image
- Selected metrics show real values and are marked with checkboxes
- User clicks "Generate Image" button to create Instagram Story-sized image
- Canvas-based image generation creates 1080x1920px image with selected metrics
- User sees preview of generated image with download and copy options
- User can customize filename before downloading
- User can copy image to clipboard for direct pasting into social apps
- User can generate new images with different metric combinations
- Generated images include subtle watermark and consistent branding

## 3) Technology (what it uses today)
**Files involved:**
- `app/share/page.tsx` (lines 1-872): Main share interface with metric selection
- `lib/share/generators/CardGenerator.ts`: Canvas-based image generation
- `lib/share/ShareService.ts` (lines 1-474): Core sharing logic and privacy filtering
- `lib/share/ShareContext.tsx` (lines 1-314): React context for sharing state
- `lib/share/types.ts`: TypeScript interfaces for sharing system

**localStorage keys:**
- `cpn-share-preferences`: User's default sharing preferences and settings
- `cpn-share-history`: History of previously generated shared content

**Key functions:**
- `CardGenerator.generateInstagramStoryCard()`: Creates canvas-based image
- `availableMetrics` array: Defines selectable metrics with categories and priorities
- `handleGenerateImage()`: Orchestrates image generation process
- `copyToClipboard()`: Copies generated image to system clipboard

## 4) Design Directions (what it looks/feels like)
- Grid layout of selectable metric tiles with category color coding
- Visual priority indicators (gold dots) for recommended metrics
- Real-time selection feedback with yellow highlights and checkboxes
- Large "Generate" button becomes active when metrics are selected
- Preview shows actual generated image at reduced size with click-to-expand
- Instagram Story aspect ratio (9:16) with professional design
- Download and clipboard buttons with loading states and success messages
- Filename customization with automatic suggestions based on selected metrics

## Data We Store (plain-English "table idea")
**Share preferences:**
- `defaultFormat`: Preferred export format (image, JSON, etc.)
- `defaultPrivacy`: Privacy settings for shared content
- `autoWatermark`: Whether to include branding watermark
- `quickShareEnabled`: Enable one-click sharing options

**Share history:**
- `id`: Unique identifier for each share action
- `type`: Type of content shared (stat card, comparison, etc.)
- `format`: Export format used (image, HTML, etc.)
- `timestamp`: When the content was shared
- `expired`: Whether the shared content is no longer valid

**Generated content:**
- Temporarily stores image blobs and URLs for download/copy operations
- Tracks selected metrics and their values at time of generation

## Who Can See What (safety/permissions in plain words)
- All image generation happens locally on the user's device
- No images or data are uploaded to any external servers
- Users control exactly which metrics appear in shared images
- Privacy settings can anonymize or filter sensitive information
- Generated images only contain the specific metrics the user selected

## Acceptance Criteria (done = true)
- User can select 1-3 metrics from categorized grid with visual feedback
- Selected metrics show real current values from user's data
- Generate button only becomes active when at least one metric is selected
- Image generation creates proper Instagram Story dimensions (1080x1920px)
- Generated image includes selected metrics with consistent branding
- Preview image can be clicked to view full-size in lightbox modal
- Download function creates PNG file with customizable filename
- Copy to clipboard works on supported browsers with success feedback
- User can generate multiple different images without page refresh
- Error handling provides helpful messages if generation fails

## Open Questions / Assumptions
- Image generation uses HTML5 Canvas for pixel-perfect output
- Clipboard API availability varies by browser and HTTPS requirement
- Generated images are temporary and not saved permanently
- File naming convention uses metric names and current date
- Canvas rendering may have performance implications on older devices

## Code References
- Main interface: `app/share/page.tsx:395-681`
- Metric selection logic: `app/share/page.tsx:137-146`
- Image generation: `app/share/page.tsx:152-221`
- Canvas generator: `lib/share/generators/CardGenerator.ts`
- Share service: `lib/share/ShareService.ts`
- Type definitions: `lib/share/types.ts`