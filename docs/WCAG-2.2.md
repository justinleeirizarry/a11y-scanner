# WCAG 2.2 Reference

A comprehensive reference for the Web Content Accessibility Guidelines (WCAG) 2.2, containing all 86 success criteria with conformance levels, normative text, and practical implementation guidance.

## Introduction

### Purpose of WCAG

The Web Content Accessibility Guidelines (WCAG) provide a single shared standard for web content accessibility that meets the needs of individuals, organizations, and governments internationally. WCAG explains how to make web content more accessible to people with disabilities, including:

- Visual impairments (blindness, low vision, color blindness)
- Hearing impairments (deafness, hard of hearing)
- Motor impairments (limited fine motor control, muscle slowness)
- Cognitive impairments (learning disabilities, distractibility, inability to focus)

### Conformance Levels

WCAG defines three levels of conformance:

| Level | Description |
|-------|-------------|
| **A** | Minimum level of accessibility. Essential requirements that must be met. |
| **AA** | Addresses the most common barriers. Recommended for most websites and required by many accessibility laws. |
| **AAA** | Highest level of accessibility. Not required as a general policy because some content cannot meet all AAA criteria. |

### How to Use This Document

Each success criterion includes:
- **Number and Title** with conformance level in parentheses
- **Normative text** from the W3C specification (quoted)
- **Implementation guidance** with practical advice
- **Link** to official W3C documentation

---

## 1. Perceivable

Information and user interface components must be presentable to users in ways they can perceive.

### 1.1 Text Alternatives

Provide text alternatives for any non-text content so that it can be changed into other forms people need, such as large print, braille, speech, symbols, or simpler language.

#### 1.1.1 Non-text Content (A)

> All non-text content that is presented to the user has a text alternative that serves the equivalent purpose, except for the following: controls and input, time-based media, tests, sensory experiences, CAPTCHAs, and decoration/formatting/invisible content.

**Implementation Guidance:**
- All images need descriptive alt text describing their purpose
- Use empty alt (`alt=""`) for purely decorative images
- Complex images (charts, diagrams) require detailed descriptions in context or linked pages
- Form buttons and inputs must have accessible names
- Embedded media needs text identification

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)

---

### 1.2 Time-based Media

Provide alternatives for time-based media.

#### 1.2.1 Audio-only and Video-only (Prerecorded) (A)

> For prerecorded audio-only and prerecorded video-only media, the following are true: for prerecorded audio-only, an alternative for time-based media is provided that presents equivalent information; for prerecorded video-only, either an alternative for time-based media or an audio track is provided that presents equivalent information.

**Implementation Guidance:**
- Provide transcripts for all audio-only content (podcasts, audio recordings)
- Provide text descriptions or audio tracks for video-only content (silent animations, slideshows)

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html)

#### 1.2.2 Captions (Prerecorded) (A)

> Captions are provided for all prerecorded audio content in synchronized media, except when the media is a media alternative for text and is clearly labeled as such.

**Implementation Guidance:**
- Add synchronized captions to all videos with audio
- Captions should include dialogue, speaker identification, and relevant sound effects
- Auto-generated captions must be reviewed and corrected for accuracy

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html)

#### 1.2.3 Audio Description or Media Alternative (Prerecorded) (A)

> An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media, except when the media is a media alternative for text and is clearly labeled as such.

**Implementation Guidance:**
- Provide audio descriptions or a full text alternative for video content
- Audio descriptions narrate important visual information not conveyed in dialogue
- Text alternatives can be transcripts that include both audio and visual information

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html)

#### 1.2.4 Captions (Live) (AA)

> Captions are provided for all live audio content in synchronized media.

**Implementation Guidance:**
- Live broadcasts, webinars, and streams require real-time captions
- Use trained captioners or high-quality automatic captioning services
- Ensure captions are synchronized with the audio

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/captions-live.html)

#### 1.2.5 Audio Description (Prerecorded) (AA)

> Audio description is provided for all prerecorded video content in synchronized media.

**Implementation Guidance:**
- Audio descriptions must be provided (not just as an alternative to text)
- Descriptions should fit into natural pauses in dialogue
- Include descriptions of actions, characters, scene changes, and on-screen text

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html)

#### 1.2.6 Sign Language (Prerecorded) (AAA)

> Sign language interpretation is provided for all prerecorded audio content in synchronized media.

**Implementation Guidance:**
- Provide sign language interpretation videos synchronized with content
- Use qualified interpreters fluent in the appropriate sign language
- Position sign language video where it doesn't obstruct content

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/sign-language-prerecorded.html)

#### 1.2.7 Extended Audio Description (Prerecorded) (AAA)

> Where pauses in foreground audio are insufficient to allow audio descriptions to convey the sense of the video, extended audio description is provided for all prerecorded video content in synchronized media.

**Implementation Guidance:**
- Pause video playback to allow for extended descriptions when needed
- Use when standard audio descriptions cannot adequately convey visual information
- Provide user controls to enable/disable extended descriptions

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html)

#### 1.2.8 Media Alternative (Prerecorded) (AAA)

> An alternative for time-based media is provided for all prerecorded synchronized media and for all prerecorded video-only media.

**Implementation Guidance:**
- Provide a complete text transcript including all audio and visual information
- Include descriptions of visual elements, dialogue, and sounds
- Format transcripts for easy reading and navigation

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/media-alternative-prerecorded.html)

#### 1.2.9 Audio-only (Live) (AAA)

> An alternative for time-based media that presents equivalent information for live audio-only content is provided.

**Implementation Guidance:**
- Provide real-time text alternatives for live audio content
- Use trained captioners or stenographers for accurate transcription
- Consider providing transcripts after the live event

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-live.html)

---

### 1.3 Adaptable

Create content that can be presented in different ways (for example simpler layout) without losing information or structure.

#### 1.3.1 Info and Relationships (A)

> Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.

**Implementation Guidance:**
- Use semantic HTML elements (headings, lists, landmarks) to structure content
- Associate data table cells with headers using proper markup
- Connect form labels to inputs using `<label>` elements
- Use ARIA only when standard HTML is insufficient

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)

#### 1.3.2 Meaningful Sequence (A)

> When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.

**Implementation Guidance:**
- Ensure DOM order matches visual reading order
- Test by disabling CSS to verify content flows logically
- Avoid using CSS to reorder content in ways that change meaning

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)

#### 1.3.3 Sensory Characteristics (A)

> Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, color, size, visual location, orientation, or sound.

**Implementation Guidance:**
- Never rely solely on shape, size, location, or sound for instructions
- Combine visual cues with text labels (e.g., "Click the square Submit button" not just "Click the square button")
- Provide multiple ways to identify elements

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html)

#### 1.3.4 Orientation (AA)

> Content does not restrict its view and operation to a single display orientation, such as portrait or landscape, unless a specific display orientation is essential.

**Implementation Guidance:**
- Support both portrait and landscape orientations
- Don't lock orientation unless essential (e.g., piano app, check deposit)
- Test content in both orientations

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/orientation.html)

#### 1.3.5 Identify Input Purpose (AA)

> The purpose of each input field collecting information about the user can be programmatically determined when the input field serves a purpose identified in the Input Purposes for User Interface Components section, and the content is implemented using technologies with support for identifying the expected meaning.

**Implementation Guidance:**
- Use `autocomplete` attributes on form fields collecting user information
- Common values: `name`, `email`, `tel`, `street-address`, `postal-code`
- Enables browsers to auto-fill and assistive technologies to provide icons

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html)

#### 1.3.6 Identify Purpose (AAA)

> In content implemented using markup languages, the purpose of user interface components, icons, and regions can be programmatically determined.

**Implementation Guidance:**
- Use ARIA landmarks to identify page regions
- Apply ARIA roles to custom components
- Use established icons with accessible names

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/identify-purpose.html)

---

### 1.4 Distinguishable

Make it easier for users to see and hear content including separating foreground from background.

#### 1.4.1 Use of Color (A)

> Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

**Implementation Guidance:**
- Don't convey information through color alone
- Use patterns, labels, or icons in addition to color
- For links distinguished only by color, maintain 3:1 contrast and add underline on hover/focus

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)

#### 1.4.2 Audio Control (A)

> If any audio on a Web page plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.

**Implementation Guidance:**
- Provide stop, pause, or mute controls for auto-playing audio
- Place controls near the beginning of the page
- Consider not auto-playing audio at all

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)

#### 1.4.3 Contrast (Minimum) (AA)

> The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for large text (3:1), incidental text, logotypes, and inactive components.

**Implementation Guidance:**
- Normal text requires 4.5:1 contrast ratio
- Large text (18pt+ or 14pt+ bold) requires 3:1 contrast ratio
- Use contrast checking tools to verify compliance
- Exceptions: decorative text, logos, disabled controls

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

#### 1.4.4 Resize Text (AA)

> Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality.

**Implementation Guidance:**
- Pages must remain readable and functional when zoomed to 200%
- Use relative units (em, rem, %) instead of fixed pixels for text
- Test by zooming browser to 200%

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

#### 1.4.5 Images of Text (AA)

> If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text, except for customizable images or where a particular presentation is essential.

**Implementation Guidance:**
- Use real text instead of images of text whenever possible
- Exceptions: logos, customizable presentations, essential visual formatting
- Use CSS for visual styling of text

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html)

#### 1.4.6 Contrast (Enhanced) (AAA)

> The visual presentation of text and images of text has a contrast ratio of at least 7:1, except for large text (4.5:1), incidental text, and logotypes.

**Implementation Guidance:**
- Normal text requires 7:1 contrast ratio
- Large text requires 4.5:1 contrast ratio
- Provides better readability for users with low vision

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)

#### 1.4.7 Low or No Background Audio (AAA)

> For prerecorded audio-only content that contains primarily speech in the foreground, background sounds are at least 20 decibels lower than the foreground speech content, can be turned off, or no background sounds are present.

**Implementation Guidance:**
- Keep background sounds at least 20dB lower than speech
- Provide option to turn off background audio
- Best practice: avoid background audio in speech content

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/low-or-no-background-audio.html)

#### 1.4.8 Visual Presentation (AAA)

> For the visual presentation of blocks of text, a mechanism is available to achieve: foreground and background colors can be selected by the user; width is no more than 80 characters; text is not justified; line spacing is at least 1.5 within paragraphs; text can be resized up to 200% without requiring horizontal scrolling.

**Implementation Guidance:**
- Allow users to customize foreground/background colors
- Limit text block width to 80 characters or 40 for CJK
- Avoid full justification of text
- Use line spacing of at least 1.5
- Support 200% resize without horizontal scrolling

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)

#### 1.4.9 Images of Text (No Exception) (AAA)

> Images of text are only used for pure decoration or where a particular presentation of text is essential to the information being conveyed.

**Implementation Guidance:**
- Use real text for all content except where specific presentation is essential
- Logos may use images of text
- Pure decoration may use images of text

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text-no-exception.html)

#### 1.4.10 Reflow (AA)

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: vertical scrolling content at a width equivalent to 320 CSS pixels; horizontal scrolling content at a height equivalent to 256 CSS pixels. Except for parts of the content which require two-dimensional layout for usage or meaning.

**Implementation Guidance:**
- Test at 1280px width with 400% zoom
- Content should reflow to single column without horizontal scrolling
- Exceptions: data tables, maps, diagrams, video, toolbars

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

#### 1.4.11 Non-text Contrast (AA)

> The visual presentation of user interface components and graphical objects have a contrast ratio of at least 3:1 against adjacent color(s), except for inactive components and where appearance is determined by user agent.

**Implementation Guidance:**
- UI components (buttons, inputs, focus indicators) need 3:1 contrast
- Meaningful parts of graphics need 3:1 contrast
- Apply to all states: default, hover, focus, active
- Exceptions: inactive/disabled controls, browser-rendered components

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

#### 1.4.12 Text Spacing (AA)

> In content implemented using markup languages that support text style properties, no loss of content or functionality occurs when setting: line height to at least 1.5 times the font size; spacing following paragraphs to at least 2 times the font size; letter spacing to at least 0.12 times the font size; word spacing to at least 0.16 times the font size.

**Implementation Guidance:**
- Avoid fixed heights on text containers
- Use relative units for spacing
- Test with browser extensions that modify text spacing
- Content must remain accessible with increased spacing

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

#### 1.4.13 Content on Hover or Focus (AA)

> Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true: dismissible (can be dismissed without moving pointer/focus), hoverable (pointer can move to new content without it disappearing), persistent (remains visible until trigger removed, user dismisses, or info is no longer valid).

**Implementation Guidance:**
- Tooltips and popovers must be dismissible (usually via Escape key)
- Users must be able to move pointer to hover content
- Content must persist until intentionally dismissed
- Don't hide content when moving pointer to it

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)

---

## 2. Operable

User interface components and navigation must be operable.

### 2.1 Keyboard Accessible

Make all functionality available from a keyboard.

#### 2.1.1 Keyboard (A)

> All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes, except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints.

**Implementation Guidance:**
- All functionality must be keyboard-accessible
- Exception: path-dependent input (free-hand drawing)
- Avoid custom shortcuts that conflict with browser/screen reader commands
- Ensure custom widgets support expected keyboard interactions

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)

#### 2.1.2 No Keyboard Trap (A)

> If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away.

**Implementation Guidance:**
- Users must be able to navigate away from all elements using keyboard
- Modals should trap focus but allow escape via Escape key or close button
- If non-standard keys are needed, inform users

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)

#### 2.1.3 Keyboard (No Exception) (AAA)

> All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.

**Implementation Guidance:**
- Same as 2.1.1 but without the path-dependent exception
- All functionality must be keyboard accessible, period

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html)

#### 2.1.4 Character Key Shortcuts (A)

> If a keyboard shortcut is implemented in content using only letter, punctuation, number, or symbol characters, then at least one of the following is true: the shortcut can be turned off; the shortcut can be remapped; the shortcut is only active when the component has focus.

**Implementation Guidance:**
- Single character key shortcuts can interfere with speech input users
- Provide option to disable shortcuts
- Allow remapping to include modifier keys (Ctrl, Alt)
- Or only activate shortcuts when specific component has focus

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)

---

### 2.2 Enough Time

Provide users enough time to read and use content.

#### 2.2.1 Timing Adjustable (A)

> For each time limit set by the content, at least one of the following is true: the user can turn off the time limit; the user can adjust the time limit (at least 10x the default); the user is warned and given at least 20 seconds to extend; the time limit is part of a real-time event; the time limit is essential; or the time limit is longer than 20 hours.

**Implementation Guidance:**
- Provide options to turn off, adjust, or extend time limits
- Warn users before timeout with option to extend
- Session timeouts should offer at least 20 seconds to extend
- Exceptions: real-time events, auctions, timed tests

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)

#### 2.2.2 Pause, Stop, Hide (A)

> For moving, blinking, scrolling, or auto-updating information: moving/blinking/scrolling content that starts automatically and lasts more than 5 seconds can be paused, stopped, or hidden; auto-updating information that starts automatically can be paused, stopped, hidden, or have frequency controlled.

**Implementation Guidance:**
- Carousels, animations, and auto-scrolling content need pause/stop controls
- Auto-updating content (feeds, stock tickers) needs user control
- Exception: if the movement is essential to the activity

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

#### 2.2.3 No Timing (AAA)

> Timing is not an essential part of the event or activity presented by the content, except for non-interactive synchronized media and real-time events.

**Implementation Guidance:**
- Remove all time limits where not essential
- Allow unlimited time for completing tasks
- Exception: media playback, live events

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/no-timing.html)

#### 2.2.4 Interruptions (AAA)

> Interruptions can be postponed or suppressed by the user, except interruptions involving an emergency.

**Implementation Guidance:**
- Allow users to control notifications and alerts
- Don't interrupt users unexpectedly
- Exception: emergency alerts

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html)

#### 2.2.5 Re-authenticating (AAA)

> When an authenticated session expires, the user can continue the activity without loss of data after re-authenticating.

**Implementation Guidance:**
- Save user data before session timeout
- Restore data after re-authentication
- Don't lose form data or in-progress work

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html)

#### 2.2.6 Timeouts (AAA)

> Users are warned of the duration of any user inactivity that could cause data loss, unless the data is preserved for more than 20 hours when the user does not take any actions.

**Implementation Guidance:**
- Inform users at the start of a process about timeout duration
- Save data for at least 20 hours, or warn about shorter timeouts
- Display timeout warnings clearly

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html)

---

### 2.3 Seizures and Physical Reactions

Do not design content in a way that is known to cause seizures or physical reactions.

#### 2.3.1 Three Flashes or Below Threshold (A)

> Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.

**Implementation Guidance:**
- Content must not flash more than 3 times per second
- If flashing is needed, ensure it's below size and contrast thresholds
- Avoid red flashes entirely when possible
- Test with photosensitive epilepsy analysis tools

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)

#### 2.3.2 Three Flashes (AAA)

> Web pages do not contain anything that flashes more than three times in any one second period.

**Implementation Guidance:**
- No flashing content allowed, regardless of size or contrast
- More strict than 2.3.1 with no threshold exceptions

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html)

#### 2.3.3 Animation from Interactions (AAA)

> Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed.

**Implementation Guidance:**
- Provide option to disable motion animations
- Respect `prefers-reduced-motion` media query
- Essential animations (showing a process) are exempt

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

---

### 2.4 Navigable

Provide ways to help users navigate, find content, and determine where they are.

#### 2.4.1 Bypass Blocks (A)

> A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.

**Implementation Guidance:**
- Provide "skip to main content" links
- Use proper heading hierarchy for navigation
- Use landmark regions (`<main>`, `<nav>`, `<header>`)
- Skip links should be visible on focus

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)

#### 2.4.2 Page Titled (A)

> Web pages have titles that describe topic or purpose.

**Implementation Guidance:**
- Every page needs a unique, descriptive `<title>`
- Include site name and specific page description
- Front-load important information in title

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html)

#### 2.4.3 Focus Order (A)

> If a Web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.

**Implementation Guidance:**
- Tab order should follow logical reading sequence
- Typically matches visual left-to-right, top-to-bottom flow
- Avoid positive `tabindex` values that disrupt natural order
- Ensure dynamically inserted content has logical focus position

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

#### 2.4.4 Link Purpose (In Context) (A)

> The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context, except where the purpose would be ambiguous to users in general.

**Implementation Guidance:**
- Link text should describe destination
- Avoid generic text like "click here" or "read more"
- If context is needed, ensure it's programmatically associated
- Use `aria-describedby` when additional context is needed

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)

#### 2.4.5 Multiple Ways (AA)

> More than one way is available to locate a Web page within a set of Web pages except where the Web page is the result of, or a step in, a process.

**Implementation Guidance:**
- Provide multiple navigation methods: site map, search, table of contents
- Related links sections help users find related content
- Exception: process steps (checkout flows)

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html)

#### 2.4.6 Headings and Labels (AA)

> Headings and labels describe topic or purpose.

**Implementation Guidance:**
- Headings should be descriptive and unique within context
- Form labels should clearly describe expected input
- Avoid duplicate headings unless structure provides differentiation

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)

#### 2.4.7 Focus Visible (AA)

> Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.

**Implementation Guidance:**
- Never remove focus indicators without providing alternatives
- Ensure focus styles are visible against all backgrounds
- Custom focus styles should be at least as visible as browser defaults
- Test keyboard navigation to verify focus visibility

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)

#### 2.4.8 Location (AAA)

> Information about the user's location within a set of Web pages is available.

**Implementation Guidance:**
- Provide breadcrumbs showing page hierarchy
- Highlight current page in navigation
- Use site maps to show overall structure

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/location.html)

#### 2.4.9 Link Purpose (Link Only) (AAA)

> A mechanism is available to allow the purpose of each link to be identified from link text alone, except where the purpose would be ambiguous to users in general.

**Implementation Guidance:**
- Every link should be understandable without surrounding context
- Avoid "Read more" - use "Read more about [topic]"
- Provide mechanism to expand abbreviated link text

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html)

#### 2.4.10 Section Headings (AAA)

> Section headings are used to organize the content.

**Implementation Guidance:**
- Use headings to break up and organize content
- Heading levels should reflect content hierarchy
- Each section should have a heading

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/section-headings.html)

#### 2.4.11 Focus Not Obscured (Minimum) (AA)

> When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.

**Implementation Guidance:**
- Ensure focused elements are not completely covered by sticky headers, footers, or modals
- At least part of the focused element must be visible
- Account for fixed-position elements when managing focus

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)

#### 2.4.12 Focus Not Obscured (Enhanced) (AAA)

> When a user interface component receives keyboard focus, no part of the component is hidden by author-created content.

**Implementation Guidance:**
- Entire focused element must be visible
- More strict than 2.4.11 - no partial obscuring allowed
- Scroll focused elements into full view

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html)

#### 2.4.13 Focus Appearance (AAA)

> When a user interface component receives keyboard focus, the focus indicator has: sufficient contrast (at least 3:1 ratio between focused and unfocused states); sufficient size (at least the area of a 2 CSS pixel thick perimeter of the unfocused component).

**Implementation Guidance:**
- Focus indicator needs 3:1 contrast against adjacent colors
- Focus indicator should be at least 2px thick around the perimeter
- Consider using outline with offset for better visibility
- Test against various background colors

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

---

### 2.5 Input Modalities

Make it easier for users to operate functionality through various inputs beyond keyboard.

#### 2.5.1 Pointer Gestures (A)

> All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless a multipoint or path-based gesture is essential.

**Implementation Guidance:**
- Provide single-tap/click alternatives for pinch, swipe, and drag gestures
- Exception: signature capture, drawing applications
- Ensure all gestures have button alternatives

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html)

#### 2.5.2 Pointer Cancellation (A)

> For functionality that can be operated using a single pointer, at least one of the following is true: no down-event activation; can abort or undo; up-event reverses down-event; essential exception.

**Implementation Guidance:**
- Use `onclick`/`onmouseup` instead of `onmousedown`
- Allow users to cancel actions by moving pointer away before release
- Provide undo for accidental activations
- Exception: piano keys, instruments

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)

#### 2.5.3 Label in Name (A)

> For user interface components with labels that include text or images of text, the name contains the text that is presented visually.

**Implementation Guidance:**
- Accessible name must include visible label text
- Critical for voice control users who speak visible labels
- Don't use different accessible names than visible labels
- Visible label should be at the start of the accessible name

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)

#### 2.5.4 Motion Actuation (A)

> Functionality that can be operated by device motion or user motion can also be operated by user interface components and responding to the motion can be disabled to prevent accidental actuation, except for supported interfaces and essential motion.

**Implementation Guidance:**
- Provide button alternatives for shake, tilt, and gesture controls
- Allow users to disable motion-triggered functionality
- Exception: motion sensors for accessibility (switch access)

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html)

#### 2.5.5 Target Size (Enhanced) (AAA)

> The size of the target for pointer inputs is at least 44 by 44 CSS pixels except for: equivalent alternative available; inline targets; user agent controlled; essential.

**Implementation Guidance:**
- Touch targets should be at least 44x44 CSS pixels
- Provide adequate spacing between targets
- Exception: inline text links, browser-controlled elements

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)

#### 2.5.6 Concurrent Input Mechanisms (AAA)

> Web content does not restrict use of input modalities available on a platform except where the restriction is essential, required to ensure the security of the content, or required to respect user settings.

**Implementation Guidance:**
- Don't disable or restrict input types (touch, mouse, keyboard)
- Allow users to switch between input methods
- Exception: security requirements (prevent touch injection)

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/concurrent-input-mechanisms.html)

#### 2.5.7 Dragging Movements (AA)

> All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author.

**Implementation Guidance:**
- Provide alternatives to drag-and-drop (up/down buttons, select menus)
- Allow clicking to select, then clicking destination
- Exception: drawing, signature capture

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

#### 2.5.8 Target Size (Minimum) (AA)

> The size of the target for pointer inputs is at least 24 by 24 CSS pixels except for: spacing (targets have sufficient spacing); equivalent alternative; inline targets; user agent controlled; essential.

**Implementation Guidance:**
- Touch targets should be at least 24x24 CSS pixels
- Or ensure at least 24px spacing between smaller targets
- Exception: inline text links, browser controls

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

---

## 3. Understandable

Information and the operation of user interface must be understandable.

### 3.1 Readable

Make text content readable and understandable.

#### 3.1.1 Language of Page (A)

> The default human language of each Web page can be programmatically determined.

**Implementation Guidance:**
- Set language on `<html>` element: `<html lang="en">`
- Use correct language code for content language
- Enables proper pronunciation by screen readers

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html)

#### 3.1.2 Language of Parts (AA)

> The human language of each passage or phrase in the content can be programmatically determined except for proper names, technical terms, words of indeterminate language, and words or phrases that have become part of the vernacular.

**Implementation Guidance:**
- Mark language changes with `lang` attribute: `<span lang="fr">Bonjour</span>`
- Helps screen readers switch pronunciation
- Exception: proper names, technical terms, common loanwords

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)

#### 3.1.3 Unusual Words (AAA)

> A mechanism is available for identifying specific definitions of words or phrases used in an unusual or restricted way, including idioms and jargon.

**Implementation Guidance:**
- Provide glossary for technical terms and jargon
- Use `<dfn>` element for definitions
- Link to definitions or provide tooltips
- Explain idioms in context

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html)

#### 3.1.4 Abbreviations (AAA)

> A mechanism for identifying the expanded form or meaning of abbreviations is available.

**Implementation Guidance:**
- Expand abbreviations on first use
- Use `<abbr>` element: `<abbr title="World Wide Web">WWW</abbr>`
- Provide glossary of abbreviations
- Link to expanded forms

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html)

#### 3.1.5 Reading Level (AAA)

> When text requires reading ability more advanced than the lower secondary education level after removal of proper names and titles, supplemental content, or a version that does not require reading ability more advanced than the lower secondary education level, is available.

**Implementation Guidance:**
- Aim for reading level around 9th grade education
- Provide simplified versions for complex content
- Use clear, simple language
- Include illustrations and diagrams

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html)

#### 3.1.6 Pronunciation (AAA)

> A mechanism is available for identifying specific pronunciation of words where meaning of the words, in context, is ambiguous without knowing the pronunciation.

**Implementation Guidance:**
- Provide pronunciation guides for ambiguous words (heteronyms)
- Use phonetic spelling or audio clips
- Example: "read" (present) vs "read" (past)

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/pronunciation.html)

---

### 3.2 Predictable

Make Web pages appear and operate in predictable ways.

#### 3.2.1 On Focus (A)

> When any user interface component receives focus, it does not initiate a change of context.

**Implementation Guidance:**
- Focusing an element should not trigger navigation, form submission, or pop-ups
- Don't automatically submit forms when last field receives focus
- Focus should not cause unexpected page changes

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html)

#### 3.2.2 On Input (A)

> Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.

**Implementation Guidance:**
- Don't auto-submit forms when user makes selection
- Warn users before input changes cause navigation
- Radio buttons and dropdowns should not trigger page changes without explicit submit

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)

#### 3.2.3 Consistent Navigation (AA)

> Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user.

**Implementation Guidance:**
- Keep navigation in same position across pages
- Maintain consistent order of navigation items
- Adding items is OK, but don't reorder existing items

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html)

#### 3.2.4 Consistent Identification (AA)

> Components that have the same functionality within a set of Web pages are identified consistently.

**Implementation Guidance:**
- Use same labels for same functions across site
- Search fields should have consistent labels
- Icon meanings should be consistent
- Same action = same label

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html)

#### 3.2.5 Change on Request (AAA)

> Changes of context are initiated only by user request or a mechanism is available to turn off such changes.

**Implementation Guidance:**
- Never auto-redirect pages without user action
- Provide controls for any automatic changes
- Let users opt out of auto-updates

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html)

#### 3.2.6 Consistent Help (A)

> If a Web page contains any of the following help mechanisms, and those mechanisms are repeated on multiple Web pages within a set of Web pages, they occur in the same relative order: human contact details; human contact mechanism; self-help option; a fully automated contact mechanism.

**Implementation Guidance:**
- Place help links in consistent locations
- Keep order of help options consistent across pages
- Applies to: contact info, chat widgets, FAQs, support links
- Users should find help in predictable locations

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html)

---

### 3.3 Input Assistance

Help users avoid and correct mistakes.

#### 3.3.1 Error Identification (A)

> If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.

**Implementation Guidance:**
- Clearly identify which field has an error
- Describe the error in text (not just color)
- Provide error messages near the problematic field
- Use `aria-invalid` and `aria-describedby` for accessibility

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)

#### 3.3.2 Labels or Instructions (A)

> Labels or instructions are provided when content requires user input.

**Implementation Guidance:**
- Every input needs a visible label
- Provide format hints for expected input (e.g., "MM/DD/YYYY")
- Indicate required fields clearly
- Group related fields with fieldsets

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)

#### 3.3.3 Error Suggestion (AA)

> If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content.

**Implementation Guidance:**
- Suggest corrections for detected errors
- Example: "Did you mean @gmail.com?"
- Exception: security-sensitive inputs (passwords)
- Provide specific, actionable suggestions

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)

#### 3.3.4 Error Prevention (Legal, Financial, Data) (AA)

> For Web pages that cause legal commitments or financial transactions or that modify or delete user-controllable data or submit user test responses, at least one of the following is true: submissions are reversible; data is checked and user can correct; a mechanism is available for confirmation before finalizing.

**Implementation Guidance:**
- Allow users to review before submitting
- Provide confirmation screens for important actions
- Allow undo for deletions
- Check data and allow corrections before final submission

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)

#### 3.3.5 Help (AAA)

> Context-sensitive help is available.

**Implementation Guidance:**
- Provide help text relevant to current task
- Include tooltips, inline help, or linked help pages
- Help should be specific to the current context/field

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/help.html)

#### 3.3.6 Error Prevention (All) (AAA)

> For Web pages that require the user to submit information, at least one of the following is true: submissions are reversible; data is checked and user can correct; a mechanism for confirmation is available.

**Implementation Guidance:**
- Same as 3.3.4 but applies to all user submissions
- Not just legal/financial transactions
- All forms should allow review and correction

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html)

#### 3.3.7 Redundant Entry (A)

> Information previously entered by or provided to the user that is required to be entered again in the same process is either auto-populated or available for the user to select, except when re-entering is essential, security requires it, or the information is no longer valid.

**Implementation Guidance:**
- Auto-fill previously entered information
- Don't ask for the same information twice in a process
- Exception: password confirmation, security verification
- Use stored values to pre-populate fields

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)

#### 3.3.8 Accessible Authentication (Minimum) (AA)

> A cognitive function test is not required for any step in an authentication process unless that step provides at least one of the following: alternative authentication method; mechanism to help complete the test; object recognition; personal content recognition.

**Implementation Guidance:**
- Don't require memorizing passwords, solving puzzles, or performing calculations
- Alternatives: passkeys, password managers, magic links, biometrics
- If CAPTCHA is used, provide audio alternative or object recognition
- Allow copy-paste for passwords

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)

#### 3.3.9 Accessible Authentication (Enhanced) (AAA)

> A cognitive function test is not required for any step in an authentication process unless that step provides at least one of the following: alternative authentication method; mechanism to help complete the test.

**Implementation Guidance:**
- Stricter than 3.3.8 - no cognitive tests even with object recognition
- Provide non-cognitive authentication methods
- Support password managers fully
- Use modern authentication (passkeys, SSO)

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html)

---

## 4. Robust

Content must be robust enough that it can be interpreted by a wide variety of user agents, including assistive technologies.

### 4.1 Compatible

Maximize compatibility with current and future user agents, including assistive technologies.

#### 4.1.1 Parsing (Obsolete)

> *This criterion was removed in WCAG 2.2 because modern browsers and assistive technologies handle parsing errors more gracefully. The original requirement for valid HTML parsing is now handled by user agents.*

**Note:** While this criterion is obsolete, using valid HTML remains a best practice for compatibility and maintainability.

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/parsing.html)

#### 4.1.2 Name, Role, Value (A)

> For all user interface components (including but not limited to form elements, links, and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.

**Implementation Guidance:**
- Use native HTML elements when possible
- Custom components need proper ARIA roles, names, and states
- Update ARIA states when component state changes
- Ensure form elements have proper labels
- Notify assistive technologies of dynamic changes

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)

#### 4.1.3 Status Messages (AA)

> In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.

**Implementation Guidance:**
- Use ARIA live regions for status updates (`aria-live="polite"`)
- Use `role="alert"` for important messages
- Use `role="status"` for less urgent updates
- Don't require focus change to convey status information
- Examples: form submission success, search results count, progress updates

[W3C Reference](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

---

## Summary

WCAG 2.2 contains **86 success criteria** (87 including the obsolete 4.1.1) organized into:

- **4 Principles**: Perceivable, Operable, Understandable, Robust
- **13 Guidelines**: High-level objectives
- **86 Success Criteria**: Testable requirements at three levels (A, AA, AAA)

### Criteria by Level

| Level | Count | Purpose |
|-------|-------|---------|
| A | 32 | Minimum accessibility requirements |
| AA | 24 | Standard compliance target (most regulations) |
| AAA | 30 | Enhanced accessibility (where applicable) |

### New in WCAG 2.2

Nine success criteria were added in WCAG 2.2:

1. **2.4.11 Focus Not Obscured (Minimum)** (AA)
2. **2.4.12 Focus Not Obscured (Enhanced)** (AAA)
3. **2.4.13 Focus Appearance** (AAA)
4. **2.5.7 Dragging Movements** (AA)
5. **2.5.8 Target Size (Minimum)** (AA)
6. **3.2.6 Consistent Help** (A)
7. **3.3.7 Redundant Entry** (A)
8. **3.3.8 Accessible Authentication (Minimum)** (AA)
9. **3.3.9 Accessible Authentication (Enhanced)** (AAA)

One criterion was removed: **4.1.1 Parsing** (marked obsolete)

---

## Resources

- [WCAG 2.2 Specification](https://www.w3.org/TR/WCAG22/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [How to Meet WCAG (Quick Reference)](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM WCAG 2.2 Checklist](https://webaim.org/standards/wcag/checklist)
- [W3C Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)
