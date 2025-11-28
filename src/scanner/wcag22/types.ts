/**
 * WCAG 2.2 Check Types
 */

export type WCAG22ViolationId =
    | 'target-size'
    | 'focus-obscured'
    | 'focus-appearance'
    | 'dragging-movement'
    | 'accessible-authentication';

export type WCAG22ExceptionType =
    | 'inline'
    | 'spacing'
    | 'equivalent'
    | 'user-agent'
    | 'essential';

export interface WCAG22Violation {
    id: WCAG22ViolationId;
    criterion: string;
    level: 'A' | 'AA' | 'AAA';
    element: string;
    selector: string;
    html: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    details: Record<string, any>;
    exception?: WCAG22ExceptionType;
}

// Target Size (2.5.8) types
export interface TargetSizeViolation extends WCAG22Violation {
    id: 'target-size';
    details: {
        actualSize: { width: number; height: number };
        requiredSize: { width: number; height: number };
        shortfall: { width: number; height: number };
    };
}

export interface TargetSizeResult {
    element: string;
    selector: string;
    html: string;
    size: { width: number; height: number };
    meetsRequirement: boolean;
    exception?: WCAG22ExceptionType;
    spacing?: { top: number; right: number; bottom: number; left: number };
}

// Focus Not Obscured (2.4.11) types
export interface FocusObscuredViolation extends WCAG22Violation {
    id: 'focus-obscured';
    details: {
        focusedElementRect: DOMRect | { top: number; left: number; bottom: number; right: number; width: number; height: number };
        obscuringElement: string;
        obscuringType: 'sticky-header' | 'sticky-footer' | 'fixed' | 'modal' | 'overlay' | 'cookie-banner';
        obscuringRect: DOMRect | { top: number; left: number; bottom: number; right: number; width: number; height: number };
        percentageObscured: number;
    };
}

// Focus Appearance (2.4.13) types
export interface FocusAppearanceViolation extends WCAG22Violation {
    id: 'focus-appearance';
    details: {
        indicatorType: 'outline' | 'border' | 'box-shadow' | 'background' | 'none';
        indicatorThickness: number;
        indicatorArea: number;
        meetsMinimumArea: boolean;
        contrastWithAdjacent: number;
        contrastWithUnfocused: number;
        meetsContrastRequirement: boolean;
    };
}

// Dragging Movements (2.5.7) types
export interface DraggingViolation extends WCAG22Violation {
    id: 'dragging-movement';
    details: {
        dragType: 'native' | 'react-beautiful-dnd' | 'dnd-kit' | 'sortablejs' | 'custom';
        hasAlternative: boolean;
        suggestedAlternatives: string[];
    };
}

// Accessible Authentication (3.3.8) types
export interface AccessibleAuthViolation extends WCAG22Violation {
    id: 'accessible-authentication';
    details: {
        authType: 'captcha-image' | 'captcha-puzzle' | 'cognitive-test' | 'memory-test';
        hasAlternative: boolean;
        allowsCopyPaste: boolean;
        supportsPasswordManager: boolean;
    };
}

// Combined results
export interface WCAG22CheckResults {
    targetSize: TargetSizeViolation[];
    focusObscured: FocusObscuredViolation[];
    focusAppearance: FocusAppearanceViolation[];
    dragging: DraggingViolation[];
    authentication: AccessibleAuthViolation[];
    summary: {
        totalViolations: number;
        byLevel: {
            A: number;
            AA: number;
            AAA: number;
        };
        byCriterion: Record<string, number>;
    };
}
