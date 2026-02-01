/**
 * WCAG 2.2 Criteria Database
 *
 * Complete database of all 86 WCAG 2.2 success criteria with metadata
 * for enriching accessibility violation reports.
 */

import type { WcagLevel } from '../types.js';

/**
 * WCAG principle categories
 */
export type WcagPrinciple = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

/**
 * Complete WCAG 2.2 criterion information
 */
export interface WcagCriterion {
    /** Criterion ID (e.g., "1.4.3") */
    id: string;
    /** Criterion title (e.g., "Contrast (Minimum)") */
    title: string;
    /** Conformance level */
    level: WcagLevel;
    /** WCAG principle */
    principle: WcagPrinciple;
    /** Guideline title (e.g., "1.4 Distinguishable") */
    guideline: string;
    /** Brief description of the criterion */
    description: string;
    /** W3C Understanding document URL */
    w3cUrl: string;
}

/**
 * Complete WCAG 2.2 criteria database
 * Contains all 86 success criteria organized by ID
 */
export const WCAG_CRITERIA: Record<string, WcagCriterion> = {
    // ============================================================================
    // Principle 1: Perceivable
    // ============================================================================

    // Guideline 1.1: Text Alternatives
    '1.1.1': {
        id: '1.1.1',
        title: 'Non-text Content',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.1 Text Alternatives',
        description: 'All non-text content has a text alternative that serves the equivalent purpose.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html'
    },

    // Guideline 1.2: Time-based Media
    '1.2.1': {
        id: '1.2.1',
        title: 'Audio-only and Video-only (Prerecorded)',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'Alternatives are provided for prerecorded audio-only and video-only media.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html'
    },
    '1.2.2': {
        id: '1.2.2',
        title: 'Captions (Prerecorded)',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'Captions are provided for all prerecorded audio content in synchronized media.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html'
    },
    '1.2.3': {
        id: '1.2.3',
        title: 'Audio Description or Media Alternative (Prerecorded)',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'An alternative or audio description is provided for prerecorded video content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html'
    },
    '1.2.4': {
        id: '1.2.4',
        title: 'Captions (Live)',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'Captions are provided for all live audio content in synchronized media.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/captions-live.html'
    },
    '1.2.5': {
        id: '1.2.5',
        title: 'Audio Description (Prerecorded)',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'Audio description is provided for all prerecorded video content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html'
    },
    '1.2.6': {
        id: '1.2.6',
        title: 'Sign Language (Prerecorded)',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'Sign language interpretation is provided for all prerecorded audio content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/sign-language-prerecorded.html'
    },
    '1.2.7': {
        id: '1.2.7',
        title: 'Extended Audio Description (Prerecorded)',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'Extended audio description is provided when pauses are insufficient.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html'
    },
    '1.2.8': {
        id: '1.2.8',
        title: 'Media Alternative (Prerecorded)',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'An alternative for time-based media is provided for all prerecorded content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/media-alternative-prerecorded.html'
    },
    '1.2.9': {
        id: '1.2.9',
        title: 'Audio-only (Live)',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.2 Time-based Media',
        description: 'An alternative is provided for live audio-only content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-live.html'
    },

    // Guideline 1.3: Adaptable
    '1.3.1': {
        id: '1.3.1',
        title: 'Info and Relationships',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.3 Adaptable',
        description: 'Information and relationships conveyed through presentation can be programmatically determined.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html'
    },
    '1.3.2': {
        id: '1.3.2',
        title: 'Meaningful Sequence',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.3 Adaptable',
        description: 'The correct reading sequence can be programmatically determined.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html'
    },
    '1.3.3': {
        id: '1.3.3',
        title: 'Sensory Characteristics',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.3 Adaptable',
        description: 'Instructions do not rely solely on sensory characteristics like shape or location.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html'
    },
    '1.3.4': {
        id: '1.3.4',
        title: 'Orientation',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.3 Adaptable',
        description: 'Content does not restrict its view to a single display orientation.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/orientation.html'
    },
    '1.3.5': {
        id: '1.3.5',
        title: 'Identify Input Purpose',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.3 Adaptable',
        description: 'The purpose of input fields collecting user information can be programmatically determined.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html'
    },
    '1.3.6': {
        id: '1.3.6',
        title: 'Identify Purpose',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.3 Adaptable',
        description: 'The purpose of UI components, icons, and regions can be programmatically determined.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-purpose.html'
    },

    // Guideline 1.4: Distinguishable
    '1.4.1': {
        id: '1.4.1',
        title: 'Use of Color',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Color is not used as the only visual means of conveying information.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html'
    },
    '1.4.2': {
        id: '1.4.2',
        title: 'Audio Control',
        level: 'A',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'A mechanism is available to pause, stop, or control audio volume.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html'
    },
    '1.4.3': {
        id: '1.4.3',
        title: 'Contrast (Minimum)',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Text has a contrast ratio of at least 4.5:1 (3:1 for large text).',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'
    },
    '1.4.4': {
        id: '1.4.4',
        title: 'Resize Text',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Text can be resized up to 200% without loss of content or functionality.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html'
    },
    '1.4.5': {
        id: '1.4.5',
        title: 'Images of Text',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Text is used instead of images of text when possible.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html'
    },
    '1.4.6': {
        id: '1.4.6',
        title: 'Contrast (Enhanced)',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Text has a contrast ratio of at least 7:1 (4.5:1 for large text).',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html'
    },
    '1.4.7': {
        id: '1.4.7',
        title: 'Low or No Background Audio',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Background sounds are at least 20dB lower than foreground speech.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/low-or-no-background-audio.html'
    },
    '1.4.8': {
        id: '1.4.8',
        title: 'Visual Presentation',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Text blocks can be customized for width, colors, spacing, and alignment.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html'
    },
    '1.4.9': {
        id: '1.4.9',
        title: 'Images of Text (No Exception)',
        level: 'AAA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Images of text are only used for pure decoration or essential presentation.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text-no-exception.html'
    },
    '1.4.10': {
        id: '1.4.10',
        title: 'Reflow',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Content can reflow without scrolling in two dimensions at 400% zoom.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/reflow.html'
    },
    '1.4.11': {
        id: '1.4.11',
        title: 'Non-text Contrast',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'UI components and graphics have a contrast ratio of at least 3:1.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html'
    },
    '1.4.12': {
        id: '1.4.12',
        title: 'Text Spacing',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'No loss of content when text spacing is adjusted.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html'
    },
    '1.4.13': {
        id: '1.4.13',
        title: 'Content on Hover or Focus',
        level: 'AA',
        principle: 'Perceivable',
        guideline: '1.4 Distinguishable',
        description: 'Hover/focus content is dismissible, hoverable, and persistent.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html'
    },

    // ============================================================================
    // Principle 2: Operable
    // ============================================================================

    // Guideline 2.1: Keyboard Accessible
    '2.1.1': {
        id: '2.1.1',
        title: 'Keyboard',
        level: 'A',
        principle: 'Operable',
        guideline: '2.1 Keyboard Accessible',
        description: 'All functionality is operable through a keyboard interface.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html'
    },
    '2.1.2': {
        id: '2.1.2',
        title: 'No Keyboard Trap',
        level: 'A',
        principle: 'Operable',
        guideline: '2.1 Keyboard Accessible',
        description: 'Keyboard focus can be moved away from any component using the keyboard.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html'
    },
    '2.1.3': {
        id: '2.1.3',
        title: 'Keyboard (No Exception)',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.1 Keyboard Accessible',
        description: 'All functionality is operable through keyboard without exception.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html'
    },
    '2.1.4': {
        id: '2.1.4',
        title: 'Character Key Shortcuts',
        level: 'A',
        principle: 'Operable',
        guideline: '2.1 Keyboard Accessible',
        description: 'Single-character key shortcuts can be turned off or remapped.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html'
    },

    // Guideline 2.2: Enough Time
    '2.2.1': {
        id: '2.2.1',
        title: 'Timing Adjustable',
        level: 'A',
        principle: 'Operable',
        guideline: '2.2 Enough Time',
        description: 'Users can turn off, adjust, or extend time limits.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html'
    },
    '2.2.2': {
        id: '2.2.2',
        title: 'Pause, Stop, Hide',
        level: 'A',
        principle: 'Operable',
        guideline: '2.2 Enough Time',
        description: 'Moving, blinking, or auto-updating content can be paused, stopped, or hidden.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html'
    },
    '2.2.3': {
        id: '2.2.3',
        title: 'No Timing',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.2 Enough Time',
        description: 'Timing is not an essential part of the activity.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/no-timing.html'
    },
    '2.2.4': {
        id: '2.2.4',
        title: 'Interruptions',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.2 Enough Time',
        description: 'Interruptions can be postponed or suppressed by the user.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html'
    },
    '2.2.5': {
        id: '2.2.5',
        title: 'Re-authenticating',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.2 Enough Time',
        description: 'Users can continue activity without data loss after re-authenticating.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html'
    },
    '2.2.6': {
        id: '2.2.6',
        title: 'Timeouts',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.2 Enough Time',
        description: 'Users are warned of timeout duration that could cause data loss.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html'
    },

    // Guideline 2.3: Seizures and Physical Reactions
    '2.3.1': {
        id: '2.3.1',
        title: 'Three Flashes or Below Threshold',
        level: 'A',
        principle: 'Operable',
        guideline: '2.3 Seizures and Physical Reactions',
        description: 'Content does not flash more than 3 times per second.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html'
    },
    '2.3.2': {
        id: '2.3.2',
        title: 'Three Flashes',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.3 Seizures and Physical Reactions',
        description: 'Content does not flash more than 3 times per second (no exceptions).',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html'
    },
    '2.3.3': {
        id: '2.3.3',
        title: 'Animation from Interactions',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.3 Seizures and Physical Reactions',
        description: 'Motion animation triggered by interaction can be disabled.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html'
    },

    // Guideline 2.4: Navigable
    '2.4.1': {
        id: '2.4.1',
        title: 'Bypass Blocks',
        level: 'A',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'A mechanism is available to bypass blocks of repeated content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html'
    },
    '2.4.2': {
        id: '2.4.2',
        title: 'Page Titled',
        level: 'A',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Web pages have titles that describe topic or purpose.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html'
    },
    '2.4.3': {
        id: '2.4.3',
        title: 'Focus Order',
        level: 'A',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Focus order preserves meaning and operability.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html'
    },
    '2.4.4': {
        id: '2.4.4',
        title: 'Link Purpose (In Context)',
        level: 'A',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Link purpose can be determined from link text or context.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html'
    },
    '2.4.5': {
        id: '2.4.5',
        title: 'Multiple Ways',
        level: 'AA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'More than one way is available to locate a page within a set.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html'
    },
    '2.4.6': {
        id: '2.4.6',
        title: 'Headings and Labels',
        level: 'AA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Headings and labels describe topic or purpose.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html'
    },
    '2.4.7': {
        id: '2.4.7',
        title: 'Focus Visible',
        level: 'AA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Keyboard focus indicator is visible.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html'
    },
    '2.4.8': {
        id: '2.4.8',
        title: 'Location',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Information about user location within a set of pages is available.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/location.html'
    },
    '2.4.9': {
        id: '2.4.9',
        title: 'Link Purpose (Link Only)',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Link purpose can be determined from link text alone.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html'
    },
    '2.4.10': {
        id: '2.4.10',
        title: 'Section Headings',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Section headings are used to organize content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/section-headings.html'
    },
    '2.4.11': {
        id: '2.4.11',
        title: 'Focus Not Obscured (Minimum)',
        level: 'AA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Focused component is not entirely hidden by author-created content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html'
    },
    '2.4.12': {
        id: '2.4.12',
        title: 'Focus Not Obscured (Enhanced)',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'No part of the focused component is hidden by author-created content.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html'
    },
    '2.4.13': {
        id: '2.4.13',
        title: 'Focus Appearance',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.4 Navigable',
        description: 'Focus indicator has sufficient size and contrast.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html'
    },

    // Guideline 2.5: Input Modalities
    '2.5.1': {
        id: '2.5.1',
        title: 'Pointer Gestures',
        level: 'A',
        principle: 'Operable',
        guideline: '2.5 Input Modalities',
        description: 'Multi-point gestures have single-pointer alternatives.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html'
    },
    '2.5.2': {
        id: '2.5.2',
        title: 'Pointer Cancellation',
        level: 'A',
        principle: 'Operable',
        guideline: '2.5 Input Modalities',
        description: 'Single pointer actions can be cancelled or undone.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html'
    },
    '2.5.3': {
        id: '2.5.3',
        title: 'Label in Name',
        level: 'A',
        principle: 'Operable',
        guideline: '2.5 Input Modalities',
        description: 'Accessible name includes the visible label text.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html'
    },
    '2.5.4': {
        id: '2.5.4',
        title: 'Motion Actuation',
        level: 'A',
        principle: 'Operable',
        guideline: '2.5 Input Modalities',
        description: 'Motion-triggered functionality has UI alternatives.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html'
    },
    '2.5.5': {
        id: '2.5.5',
        title: 'Target Size (Enhanced)',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.5 Input Modalities',
        description: 'Pointer targets are at least 44x44 CSS pixels.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html'
    },
    '2.5.6': {
        id: '2.5.6',
        title: 'Concurrent Input Mechanisms',
        level: 'AAA',
        principle: 'Operable',
        guideline: '2.5 Input Modalities',
        description: 'Content does not restrict use of different input modalities.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/concurrent-input-mechanisms.html'
    },
    '2.5.7': {
        id: '2.5.7',
        title: 'Dragging Movements',
        level: 'AA',
        principle: 'Operable',
        guideline: '2.5 Input Modalities',
        description: 'Dragging operations have single-pointer alternatives.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html'
    },
    '2.5.8': {
        id: '2.5.8',
        title: 'Target Size (Minimum)',
        level: 'AA',
        principle: 'Operable',
        guideline: '2.5 Input Modalities',
        description: 'Pointer targets are at least 24x24 CSS pixels.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html'
    },

    // ============================================================================
    // Principle 3: Understandable
    // ============================================================================

    // Guideline 3.1: Readable
    '3.1.1': {
        id: '3.1.1',
        title: 'Language of Page',
        level: 'A',
        principle: 'Understandable',
        guideline: '3.1 Readable',
        description: 'The default language of the page can be programmatically determined.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html'
    },
    '3.1.2': {
        id: '3.1.2',
        title: 'Language of Parts',
        level: 'AA',
        principle: 'Understandable',
        guideline: '3.1 Readable',
        description: 'The language of passages or phrases can be programmatically determined.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html'
    },
    '3.1.3': {
        id: '3.1.3',
        title: 'Unusual Words',
        level: 'AAA',
        principle: 'Understandable',
        guideline: '3.1 Readable',
        description: 'A mechanism identifies definitions of unusual words or jargon.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html'
    },
    '3.1.4': {
        id: '3.1.4',
        title: 'Abbreviations',
        level: 'AAA',
        principle: 'Understandable',
        guideline: '3.1 Readable',
        description: 'A mechanism identifies the expanded form of abbreviations.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html'
    },
    '3.1.5': {
        id: '3.1.5',
        title: 'Reading Level',
        level: 'AAA',
        principle: 'Understandable',
        guideline: '3.1 Readable',
        description: 'Content is available at a lower secondary education reading level.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html'
    },
    '3.1.6': {
        id: '3.1.6',
        title: 'Pronunciation',
        level: 'AAA',
        principle: 'Understandable',
        guideline: '3.1 Readable',
        description: 'A mechanism identifies pronunciation of ambiguous words.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/pronunciation.html'
    },

    // Guideline 3.2: Predictable
    '3.2.1': {
        id: '3.2.1',
        title: 'On Focus',
        level: 'A',
        principle: 'Understandable',
        guideline: '3.2 Predictable',
        description: 'Focusing a component does not initiate a change of context.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html'
    },
    '3.2.2': {
        id: '3.2.2',
        title: 'On Input',
        level: 'A',
        principle: 'Understandable',
        guideline: '3.2 Predictable',
        description: 'Changing a setting does not automatically cause a context change.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/on-input.html'
    },
    '3.2.3': {
        id: '3.2.3',
        title: 'Consistent Navigation',
        level: 'AA',
        principle: 'Understandable',
        guideline: '3.2 Predictable',
        description: 'Navigation mechanisms occur in the same relative order.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html'
    },
    '3.2.4': {
        id: '3.2.4',
        title: 'Consistent Identification',
        level: 'AA',
        principle: 'Understandable',
        guideline: '3.2 Predictable',
        description: 'Components with the same functionality are identified consistently.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html'
    },
    '3.2.5': {
        id: '3.2.5',
        title: 'Change on Request',
        level: 'AAA',
        principle: 'Understandable',
        guideline: '3.2 Predictable',
        description: 'Changes of context are initiated only by user request.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html'
    },
    '3.2.6': {
        id: '3.2.6',
        title: 'Consistent Help',
        level: 'A',
        principle: 'Understandable',
        guideline: '3.2 Predictable',
        description: 'Help mechanisms occur in the same relative order across pages.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html'
    },

    // Guideline 3.3: Input Assistance
    '3.3.1': {
        id: '3.3.1',
        title: 'Error Identification',
        level: 'A',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'Input errors are identified and described to the user in text.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html'
    },
    '3.3.2': {
        id: '3.3.2',
        title: 'Labels or Instructions',
        level: 'A',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'Labels or instructions are provided for user input.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html'
    },
    '3.3.3': {
        id: '3.3.3',
        title: 'Error Suggestion',
        level: 'AA',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'Suggestions for correction are provided for detected errors.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html'
    },
    '3.3.4': {
        id: '3.3.4',
        title: 'Error Prevention (Legal, Financial, Data)',
        level: 'AA',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'Submissions are reversible, checked, or confirmed.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html'
    },
    '3.3.5': {
        id: '3.3.5',
        title: 'Help',
        level: 'AAA',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'Context-sensitive help is available.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/help.html'
    },
    '3.3.6': {
        id: '3.3.6',
        title: 'Error Prevention (All)',
        level: 'AAA',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'All submissions are reversible, checked, or confirmed.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html'
    },
    '3.3.7': {
        id: '3.3.7',
        title: 'Redundant Entry',
        level: 'A',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'Previously entered information is auto-populated or selectable.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html'
    },
    '3.3.8': {
        id: '3.3.8',
        title: 'Accessible Authentication (Minimum)',
        level: 'AA',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'Cognitive function tests are not required for authentication.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html'
    },
    '3.3.9': {
        id: '3.3.9',
        title: 'Accessible Authentication (Enhanced)',
        level: 'AAA',
        principle: 'Understandable',
        guideline: '3.3 Input Assistance',
        description: 'No cognitive function tests required, with fewer exceptions.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html'
    },

    // ============================================================================
    // Principle 4: Robust
    // ============================================================================

    // Guideline 4.1: Compatible
    // Note: 4.1.1 Parsing is obsolete in WCAG 2.2 but kept for axe-core compatibility
    '4.1.1': {
        id: '4.1.1',
        title: 'Parsing (Obsolete)',
        level: 'A',
        principle: 'Robust',
        guideline: '4.1 Compatible',
        description: 'OBSOLETE in WCAG 2.2. Previously required unique IDs and valid markup.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/parsing.html'
    },
    '4.1.2': {
        id: '4.1.2',
        title: 'Name, Role, Value',
        level: 'A',
        principle: 'Robust',
        guideline: '4.1 Compatible',
        description: 'UI components have programmatically determinable name, role, and state.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html'
    },
    '4.1.3': {
        id: '4.1.3',
        title: 'Status Messages',
        level: 'AA',
        principle: 'Robust',
        guideline: '4.1 Compatible',
        description: 'Status messages can be presented to users by assistive technologies.',
        w3cUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html'
    }
};

/**
 * Get all WCAG criteria as an array
 */
export function getAllCriteria(): WcagCriterion[] {
    return Object.values(WCAG_CRITERIA);
}

/**
 * Get total count of criteria
 */
export function getCriteriaCount(): number {
    return Object.keys(WCAG_CRITERIA).length;
}
