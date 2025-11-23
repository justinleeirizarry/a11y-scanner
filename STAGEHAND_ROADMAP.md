# Stagehand Integration Roadmap

> AI-powered deep accessibility testing using Stagehand browser automation

## Overview

This roadmap outlines the integration of [Stagehand](https://docs.stagehand.dev) into `react-a11y-scanner` to enable advanced, AI-powered accessibility testing that goes beyond static analysis.

### Why Stagehand?

- **AI-Powered Element Discovery**: Automatically identify interactive elements and complex UI patterns
- **Dynamic Testing**: Test real user flows and interactions, not just static HTML
- **Context-Aware Analysis**: Generate better fix suggestions based on actual page behavior
- **Advanced Pattern Detection**: Validate complex ARIA patterns and keyboard interactions

---

## Phase 1: Foundation (Weeks 1-2)

### Goals
- Add Stagehand as optional dependency
- Create basic integration layer
- Implement simple element discovery

### Tasks

- [ ] **Add Dependencies**
  ```bash
  npm install @browserbasehq/stagehand zod
  ```

- [ ] **Create Configuration Module**
  - Add CLI flags: `--stagehand`, `--stagehand-model`
  - Support environment variables for API keys
  - Add to existing config system

- [ ] **Basic Integration Module**
  - Create `src/scanner/stagehand/index.ts`
  - Implement initialization and cleanup
  - Add error handling for missing API keys

### Code Example: Basic Setup

```typescript
// src/scanner/stagehand/index.ts
import { Stagehand } from "@browserbasehq/stagehand";
import type { V3Options } from "@browserbasehq/stagehand";

export interface StagehandConfig {
  enabled: boolean;
  model?: string;
  apiKey?: string;
  verbose?: boolean;
}

export class StagehandScanner {
  private stagehand: Stagehand | null = null;
  
  constructor(private config: StagehandConfig) {}
  
  async init(url: string): Promise<void> {
    if (!this.config.enabled) return;
    
    const options: V3Options = {
      env: "LOCAL",
      model: this.config.model || "anthropic/claude-3-5-sonnet-20241022",
      verbose: this.config.verbose ? 2 : 0,
      localBrowserLaunchOptions: {
        headless: true
      }
    };
    
    this.stagehand = new Stagehand(options);
    await this.stagehand.init();
    
    const page = this.stagehand.context.pages()[0];
    await page.goto(url);
  }
  
  async discoverElements(): Promise<ElementDiscovery[]> {
    if (!this.stagehand) {
      throw new Error("Stagehand not initialized");
    }
    
    const actions = await this.stagehand.observe(
      "find all interactive elements including buttons, links, form inputs, custom controls, and widgets"
    );
    
    return actions.map(action => ({
      selector: action.selector,
      description: action.description,
      suggestedMethod: action.method,
      type: this.categorizeElement(action.description)
    }));
  }
  
  private categorizeElement(description: string): ElementType {
    const lower = description.toLowerCase();
    if (lower.includes('button')) return 'button';
    if (lower.includes('link')) return 'link';
    if (lower.includes('input') || lower.includes('field')) return 'input';
    if (lower.includes('checkbox')) return 'checkbox';
    if (lower.includes('radio')) return 'radio';
    if (lower.includes('select') || lower.includes('dropdown')) return 'select';
    return 'custom';
  }
  
  async close(): Promise<void> {
    if (this.stagehand) {
      await this.stagehand.close();
    }
  }
}

export interface ElementDiscovery {
  selector: string;
  description: string;
  suggestedMethod?: string;
  type: ElementType;
}

export type ElementType = 
  | 'button' 
  | 'link' 
  | 'input' 
  | 'checkbox' 
  | 'radio' 
  | 'select' 
  | 'custom';
```

### CLI Integration

```typescript
// src/cli/index.ts (additions)
program
  .option('--stagehand', 'Enable AI-powered deep accessibility testing')
  .option('--stagehand-model <model>', 'AI model to use (e.g., openai/gpt-4o, anthropic/claude-3-5-sonnet-20241022)')
  .option('--stagehand-verbose', 'Enable verbose Stagehand logging');
```

---

## Phase 2: ARIA Pattern Detection (Weeks 3-4)

### Goals
- Detect and validate common ARIA patterns
- Identify incomplete or incorrect implementations
- Generate pattern-specific recommendations

### Tasks

- [ ] **Pattern Detection Module**
  - Create pattern definitions (modals, tabs, accordions, etc.)
  - Implement pattern extraction using Stagehand
  - Validate against WAI-ARIA Authoring Practices

- [ ] **Pattern Validation**
  - Check required ARIA attributes
  - Verify keyboard interaction support
  - Validate focus management

### Code Example: ARIA Pattern Detection

```typescript
// src/scanner/stagehand/patterns.ts
import { z } from "zod";

export const AriaPatternSchema = z.object({
  patterns: z.array(z.object({
    type: z.enum([
      'modal',
      'tabs',
      'accordion',
      'combobox',
      'menu',
      'tree',
      'carousel',
      'tooltip',
      'disclosure'
    ]),
    role: z.string(),
    location: z.string(),
    requiredAttributes: z.array(z.string()),
    missingAttributes: z.array(z.string()),
    hasKeyboardSupport: z.boolean(),
    hasFocusManagement: z.boolean(),
    complete: z.boolean(),
    issues: z.array(z.string()).optional()
  }))
});

export type AriaPatterns = z.infer<typeof AriaPatternSchema>;

export class PatternDetector {
  constructor(private stagehand: Stagehand) {}
  
  async detectPatterns(): Promise<AriaPatterns> {
    const patterns = await this.stagehand.extract(
      `Analyze the page and identify all ARIA design patterns in use.
      
      For each pattern found, determine:
      - The pattern type (modal, tabs, accordion, etc.)
      - The ARIA role being used
      - Location/description of where it appears
      - Which required ARIA attributes are present
      - Which required ARIA attributes are missing
      - Whether keyboard support appears to be implemented
      - Whether focus management appears correct
      - Whether the implementation is complete
      - Any specific issues or concerns
      
      Common patterns to look for:
      - Modals/Dialogs (role="dialog", aria-modal, focus trap)
      - Tab Panels (role="tablist", "tab", "tabpanel")
      - Accordions (role="region", aria-expanded)
      - Comboboxes (role="combobox", aria-controls, aria-expanded)
      - Menus (role="menu", "menuitem")
      - Carousels (rotation controls, live regions)
      - Tooltips (role="tooltip", aria-describedby)`,
      AriaPatternSchema
    );
    
    return patterns;
  }
  
  async validatePattern(pattern: AriaPatterns['patterns'][0]): Promise<PatternValidation> {
    // Use Stagehand to interact with the pattern and verify behavior
    const validation: PatternValidation = {
      pattern: pattern.type,
      passed: [],
      failed: [],
      warnings: []
    };
    
    switch (pattern.type) {
      case 'modal':
        await this.validateModal(pattern, validation);
        break;
      case 'tabs':
        await this.validateTabs(pattern, validation);
        break;
      // ... other patterns
    }
    
    return validation;
  }
  
  private async validateModal(
    pattern: AriaPatterns['patterns'][0], 
    validation: PatternValidation
  ): Promise<void> {
    // Check for required attributes
    if (pattern.requiredAttributes.includes('aria-modal')) {
      validation.passed.push('Has aria-modal attribute');
    } else {
      validation.failed.push('Missing aria-modal attribute');
    }
    
    if (pattern.requiredAttributes.includes('aria-labelledby') || 
        pattern.requiredAttributes.includes('aria-label')) {
      validation.passed.push('Has accessible name');
    } else {
      validation.failed.push('Missing accessible name (aria-labelledby or aria-label)');
    }
    
    // Test keyboard interaction
    if (!pattern.hasKeyboardSupport) {
      validation.failed.push('Keyboard support not detected');
    }
    
    // Test focus trap
    if (!pattern.hasFocusManagement) {
      validation.warnings.push('Focus management may not be properly implemented');
    }
  }
  
  private async validateTabs(
    pattern: AriaPatterns['patterns'][0],
    validation: PatternValidation
  ): Promise<void> {
    // Validate tab pattern implementation
    const requiredRoles = ['tablist', 'tab', 'tabpanel'];
    const hasAllRoles = requiredRoles.every(role => 
      pattern.requiredAttributes.some(attr => attr.includes(role))
    );
    
    if (hasAllRoles) {
      validation.passed.push('All required roles present');
    } else {
      validation.failed.push('Missing required roles for tab pattern');
    }
    
    // Check arrow key navigation
    if (pattern.hasKeyboardSupport) {
      validation.passed.push('Keyboard navigation appears implemented');
    } else {
      validation.failed.push('Arrow key navigation not detected');
    }
  }
}

export interface PatternValidation {
  pattern: string;
  passed: string[];
  failed: string[];
  warnings: string[];
}
```

---

## Phase 3: Keyboard Navigation Testing (Weeks 5-6)

### Goals
- Automated keyboard navigation testing
- Tab order validation
- Focus trap detection
- Keyboard shortcut verification

### Tasks

- [ ] **Keyboard Testing Module**
  - Simulate keyboard-only navigation
  - Track focus order and visibility
  - Detect focus traps and dead ends

- [ ] **Integration with Existing Tests**
  - Enhance current keyboard navigation tests
  - Add Stagehand-powered flow testing
  - Generate visual tab order reports

### Code Example: Keyboard Navigation Testing

```typescript
// src/scanner/stagehand/keyboard.ts
export class KeyboardNavigationTester {
  constructor(private stagehand: Stagehand) {}
  
  async testTabOrder(): Promise<TabOrderResult> {
    const page = this.stagehand.context.pages()[0];
    const focusedElements: FocusedElement[] = [];
    
    // Get all interactive elements first
    const interactiveElements = await this.stagehand.observe(
      "find all focusable elements in tab order"
    );
    
    // Simulate tabbing through the page
    for (let i = 0; i < interactiveElements.length; i++) {
      await page.keyPress('Tab');
      await page.waitForTimeout(100);
      
      // Get currently focused element info
      const focusInfo = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        
        return {
          tagName: el.tagName,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          text: el.textContent?.trim().substring(0, 50),
          visible: el.checkVisibility(),
          rect: el.getBoundingClientRect()
        };
      });
      
      if (focusInfo) {
        focusedElements.push({
          order: i + 1,
          ...focusInfo,
          expectedOrder: i + 1,
          visualOrder: this.calculateVisualOrder(focusInfo.rect, focusedElements)
        });
      }
    }
    
    return this.analyzeTabOrder(focusedElements);
  }
  
  private calculateVisualOrder(
    rect: DOMRect, 
    previousElements: FocusedElement[]
  ): number {
    // Calculate visual order based on position (top-to-bottom, left-to-right)
    let visualOrder = 1;
    
    for (const prev of previousElements) {
      if (prev.rect.top < rect.top || 
          (prev.rect.top === rect.top && prev.rect.left < rect.left)) {
        visualOrder++;
      }
    }
    
    return visualOrder;
  }
  
  private analyzeTabOrder(elements: FocusedElement[]): TabOrderResult {
    const issues: TabOrderIssue[] = [];
    
    // Check for tab order mismatches
    for (const element of elements) {
      if (element.order !== element.visualOrder) {
        issues.push({
          type: 'order-mismatch',
          element: element.text || element.tagName,
          expected: element.visualOrder,
          actual: element.order,
          severity: 'warning',
          message: `Tab order (${element.order}) doesn't match visual order (${element.visualOrder})`
        });
      }
      
      if (!element.visible) {
        issues.push({
          type: 'invisible-focus',
          element: element.text || element.tagName,
          severity: 'error',
          message: 'Element receives focus but is not visible'
        });
      }
    }
    
    return {
      totalElements: elements.length,
      elements,
      issues,
      passed: issues.filter(i => i.severity !== 'error').length === issues.length
    };
  }
  
  async testFocusTraps(): Promise<FocusTrapResult[]> {
    const results: FocusTrapResult[] = [];
    
    // Find modals and dialogs
    const modals = await this.stagehand.observe(
      "find all modal dialogs or overlays"
    );
    
    for (const modal of modals) {
      // Open the modal (if there's a trigger)
      const trigger = await this.stagehand.observe(
        `find the button or element that opens: ${modal.description}`
      );
      
      if (trigger.length > 0) {
        await this.stagehand.act({ action: trigger[0] });
        await this.stagehand.context.pages()[0].waitForTimeout(500);
        
        // Test if focus is trapped
        const trapResult = await this.testModalFocusTrap();
        results.push({
          modal: modal.description,
          ...trapResult
        });
      }
    }
    
    return results;
  }
  
  private async testModalFocusTrap(): Promise<Omit<FocusTrapResult, 'modal'>> {
    const page = this.stagehand.context.pages()[0];
    
    // Try to tab out of modal
    const initialFocus = await page.evaluate(() => document.activeElement?.tagName);
    
    // Tab forward many times
    for (let i = 0; i < 20; i++) {
      await page.keyPress('Tab');
    }
    
    const afterForwardTab = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      inModal: document.activeElement?.closest('[role="dialog"]') !== null
    }));
    
    // Tab backward many times
    for (let i = 0; i < 20; i++) {
      await page.keyPress('Shift+Tab');
    }
    
    const afterBackwardTab = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      inModal: document.activeElement?.closest('[role="dialog"]') !== null
    }));
    
    return {
      hasFocusTrap: afterForwardTab.inModal && afterBackwardTab.inModal,
      canEscapeForward: !afterForwardTab.inModal,
      canEscapeBackward: !afterBackwardTab.inModal,
      passed: afterForwardTab.inModal && afterBackwardTab.inModal
    };
  }
}

export interface FocusedElement {
  order: number;
  tagName: string;
  role: string | null;
  ariaLabel: string | null;
  text: string | null;
  visible: boolean;
  rect: DOMRect;
  expectedOrder: number;
  visualOrder: number;
}

export interface TabOrderIssue {
  type: 'order-mismatch' | 'invisible-focus' | 'skip' | 'trap';
  element: string;
  expected?: number;
  actual?: number;
  severity: 'error' | 'warning';
  message: string;
}

export interface TabOrderResult {
  totalElements: number;
  elements: FocusedElement[];
  issues: TabOrderIssue[];
  passed: boolean;
}

export interface FocusTrapResult {
  modal: string;
  hasFocusTrap: boolean;
  canEscapeForward: boolean;
  canEscapeBackward: boolean;
  passed: boolean;
}
```

---

## Phase 4: User Flow Testing (Weeks 7-8)

### Goals
- Test complete user journeys
- Validate multi-step processes
- Screen reader simulation
- Generate flow-based reports

### Tasks

- [ ] **Flow Testing Module**
  - Define common user flows
  - Use Stagehand agent for autonomous testing
  - Track accessibility throughout flows

- [ ] **Screen Reader Simulation**
  - Extract announced content
  - Validate live regions
  - Test dynamic updates

### Code Example: User Flow Testing

```typescript
// src/scanner/stagehand/flows.ts
export class FlowTester {
  constructor(private stagehand: Stagehand) {}
  
  async testCheckoutFlow(): Promise<FlowTestResult> {
    const agent = this.stagehand.agent({
      goal: `Complete a checkout process as a keyboard-only user.
      
      Steps:
      1. Navigate to product page
      2. Add item to cart using only keyboard
      3. Navigate to cart
      4. Proceed to checkout
      5. Fill out shipping information
      6. Complete purchase
      
      Track:
      - Can all steps be completed with keyboard only?
      - Are focus indicators visible at each step?
      - Are error messages announced properly?
      - Is the user informed of progress?`,
      maxSteps: 20
    });
    
    const result = await agent.run();
    
    return {
      flowName: 'checkout',
      completed: result.success,
      steps: result.steps,
      accessibilityIssues: await this.extractFlowIssues(result),
      recommendations: this.generateFlowRecommendations(result)
    };
  }
  
  async testFormFlow(formSelector: string): Promise<FormFlowResult> {
    const page = this.stagehand.context.pages()[0];
    
    // Extract form structure
    const formStructure = await this.stagehand.extract(
      `Analyze the form and extract:
      - All form fields (inputs, selects, textareas, checkboxes, radios)
      - Labels and their associations
      - Required fields
      - Error message locations
      - Submit button`,
      z.object({
        fields: z.array(z.object({
          type: z.string(),
          label: z.string().optional(),
          hasLabel: z.boolean(),
          required: z.boolean(),
          hasErrorContainer: z.boolean(),
          placeholder: z.string().optional()
        })),
        submitButton: z.object({
          text: z.string(),
          disabled: z.boolean()
        })
      })
    );
    
    // Test form submission with errors
    await this.stagehand.act("submit the form without filling it out");
    await page.waitForTimeout(1000);
    
    // Check error announcements
    const errorHandling = await page.evaluate(() => {
      const liveRegions = document.querySelectorAll('[aria-live]');
      const errorMessages = document.querySelectorAll('[role="alert"]');
      
      return {
        hasLiveRegions: liveRegions.length > 0,
        hasAlerts: errorMessages.length > 0,
        errorCount: errorMessages.length,
        errors: Array.from(errorMessages).map(el => el.textContent)
      };
    });
    
    return {
      formStructure,
      errorHandling,
      issues: this.validateFormAccessibility(formStructure, errorHandling),
      passed: this.isFormAccessible(formStructure, errorHandling)
    };
  }
  
  private validateFormAccessibility(
    structure: any,
    errorHandling: any
  ): string[] {
    const issues: string[] = [];
    
    // Check for unlabeled fields
    const unlabeled = structure.fields.filter((f: any) => !f.hasLabel);
    if (unlabeled.length > 0) {
      issues.push(`${unlabeled.length} form field(s) missing labels`);
    }
    
    // Check for error announcement
    if (!errorHandling.hasLiveRegions && !errorHandling.hasAlerts) {
      issues.push('Form errors may not be announced to screen readers');
    }
    
    // Check required field indicators
    const requiredWithoutIndicator = structure.fields.filter(
      (f: any) => f.required && !f.label?.includes('*') && !f.label?.toLowerCase().includes('required')
    );
    if (requiredWithoutIndicator.length > 0) {
      issues.push(`${requiredWithoutIndicator.length} required field(s) not clearly marked`);
    }
    
    return issues;
  }
  
  private isFormAccessible(structure: any, errorHandling: any): boolean {
    return structure.fields.every((f: any) => f.hasLabel) &&
           (errorHandling.hasLiveRegions || errorHandling.hasAlerts);
  }
}

export interface FlowTestResult {
  flowName: string;
  completed: boolean;
  steps: any[];
  accessibilityIssues: string[];
  recommendations: string[];
}

export interface FormFlowResult {
  formStructure: any;
  errorHandling: any;
  issues: string[];
  passed: boolean;
}
```

---

## Phase 5: Enhanced Reporting (Weeks 9-10)

### Goals
- Integrate Stagehand findings into existing reports
- Generate visual flow diagrams
- Create actionable recommendations
- Add metrics and scoring

### Tasks

- [ ] **Report Integration**
  - Merge Stagehand results with axe-core findings
  - Create unified violation format
  - Add pattern-specific recommendations

- [ ] **Visual Reports**
  - Generate tab order visualizations
  - Create flow diagrams
  - Screenshot problematic areas

### Code Example: Enhanced Reporting

```typescript
// src/scanner/stagehand/reporter.ts
export class StagehandReporter {
  generateReport(results: StagehandResults): EnhancedReport {
    return {
      summary: this.generateSummary(results),
      elementDiscovery: this.formatElementDiscovery(results.elements),
      ariaPatterns: this.formatPatternFindings(results.patterns),
      keyboardNavigation: this.formatKeyboardResults(results.keyboard),
      userFlows: this.formatFlowResults(results.flows),
      recommendations: this.generateRecommendations(results),
      score: this.calculateAccessibilityScore(results)
    };
  }
  
  private generateSummary(results: StagehandResults): ReportSummary {
    return {
      totalInteractiveElements: results.elements.length,
      patternsDetected: results.patterns.length,
      patternsComplete: results.patterns.filter(p => p.complete).length,
      keyboardAccessible: results.keyboard.passed,
      flowsCompleted: results.flows.filter(f => f.completed).length,
      criticalIssues: this.countCriticalIssues(results),
      timestamp: new Date().toISOString()
    };
  }
  
  private formatPatternFindings(patterns: AriaPatterns['patterns']): PatternReport[] {
    return patterns.map(pattern => ({
      type: pattern.type,
      location: pattern.location,
      status: pattern.complete ? 'complete' : 'incomplete',
      missingAttributes: pattern.missingAttributes,
      issues: pattern.issues || [],
      recommendation: this.getPatternRecommendation(pattern),
      wcagCriteria: this.getWCAGCriteriaForPattern(pattern.type),
      codeExample: this.getPatternCodeExample(pattern.type)
    }));
  }
  
  private getPatternRecommendation(pattern: AriaPatterns['patterns'][0]): string {
    const recommendations: Record<string, string> = {
      modal: `Ensure the modal has:
- aria-modal="true" on the dialog element
- aria-labelledby pointing to the modal title
- Focus trap to keep focus within the modal
- Escape key to close
- Focus restoration when closed`,
      
      tabs: `Ensure the tab interface has:
- role="tablist" on the container
- role="tab" on each tab button
- role="tabpanel" on each panel
- aria-selected on the active tab
- Arrow key navigation between tabs
- Proper aria-controls associations`,
      
      accordion: `Ensure the accordion has:
- Unique IDs for each button and panel
- aria-expanded on each button
- aria-controls linking buttons to panels
- Keyboard support (Enter/Space to toggle)
- Proper heading structure`,
      
      // ... more patterns
    };
    
    return recommendations[pattern.type] || 'Follow WAI-ARIA Authoring Practices for this pattern';
  }
  
  private getPatternCodeExample(type: string): string {
    const examples: Record<string, string> = {
      modal: `<!-- Modal Dialog Example -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Title</h2>
  <div>
    <p>Modal content...</p>
    <button>Action</button>
    <button>Close</button>
  </div>
</div>`,
      
      tabs: `<!-- Tabs Example -->
<div>
  <div role="tablist" aria-label="Sample Tabs">
    <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
      Tab 1
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
      Tab 2
    </button>
  </div>
  <div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    Panel 1 content
  </div>
  <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    Panel 2 content
  </div>
</div>`,
      
      // ... more examples
    };
    
    return examples[type] || '';
  }
  
  private calculateAccessibilityScore(results: StagehandResults): AccessibilityScore {
    let score = 100;
    let breakdown: ScoreBreakdown = {
      elements: 0,
      patterns: 0,
      keyboard: 0,
      flows: 0
    };
    
    // Deduct for missing labels/roles
    const unlabeledElements = results.elements.filter(e => 
      !e.description.includes('label') && e.type === 'input'
    ).length;
    breakdown.elements = Math.max(0, 25 - (unlabeledElements * 5));
    
    // Deduct for incomplete patterns
    const incompletePatterns = results.patterns.filter(p => !p.complete).length;
    breakdown.patterns = Math.max(0, 25 - (incompletePatterns * 10));
    
    // Keyboard navigation score
    breakdown.keyboard = results.keyboard.passed ? 25 : 
      Math.max(0, 25 - (results.keyboard.issues.length * 5));
    
    // Flow completion score
    const completedFlows = results.flows.filter(f => f.completed).length;
    const totalFlows = results.flows.length;
    breakdown.flows = totalFlows > 0 ? (completedFlows / totalFlows) * 25 : 25;
    
    score = breakdown.elements + breakdown.patterns + breakdown.keyboard + breakdown.flows;
    
    return {
      total: Math.round(score),
      breakdown,
      grade: this.getGrade(score)
    };
  }
  
  private getGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

export interface EnhancedReport {
  summary: ReportSummary;
  elementDiscovery: any[];
  ariaPatterns: PatternReport[];
  keyboardNavigation: any;
  userFlows: any[];
  recommendations: string[];
  score: AccessibilityScore;
}

export interface AccessibilityScore {
  total: number;
  breakdown: ScoreBreakdown;
  grade: string;
}

export interface ScoreBreakdown {
  elements: number;
  patterns: number;
  keyboard: number;
  flows: number;
}
```

---

## CLI Usage Examples

### Basic Stagehand Scan

```bash
# Enable Stagehand with default settings
npx react-a11y-scanner http://localhost:3000 --stagehand

# Specify AI model
npx react-a11y-scanner http://localhost:3000 --stagehand --stagehand-model openai/gpt-4o

# Verbose output
npx react-a11y-scanner http://localhost:3000 --stagehand --stagehand-verbose
```

### Pattern Detection

```bash
# Focus on ARIA pattern detection
npx react-a11y-scanner http://localhost:3000 --stagehand --patterns-only

# Test specific pattern types
npx react-a11y-scanner http://localhost:3000 --stagehand --patterns modal,tabs,accordion
```

### Keyboard Testing

```bash
# Run keyboard navigation tests
npx react-a11y-scanner http://localhost:3000 --stagehand --keyboard-test

# Test focus traps
npx react-a11y-scanner http://localhost:3000 --stagehand --test-focus-traps
```

### Flow Testing

```bash
# Test checkout flow
npx react-a11y-scanner http://localhost:3000 --stagehand --test-flow checkout

# Test form submission
npx react-a11y-scanner http://localhost:3000 --stagehand --test-flow form
```

### Combined Analysis

```bash
# Full deep scan with all features
npx react-a11y-scanner http://localhost:3000 \
  --stagehand \
  --stagehand-model anthropic/claude-3-5-sonnet-20241022 \
  --patterns \
  --keyboard-test \
  --test-flow all \
  --output stagehand-report.json
```

---

## Configuration File Support

```json
// .a11yrc.json
{
  "stagehand": {
    "enabled": true,
    "model": "anthropic/claude-3-5-sonnet-20241022",
    "features": {
      "elementDiscovery": true,
      "patternDetection": true,
      "keyboardTesting": true,
      "flowTesting": true
    },
    "patterns": ["modal", "tabs", "accordion", "combobox"],
    "flows": ["checkout", "form", "navigation"],
    "options": {
      "verbose": false,
      "headless": true,
      "timeout": 30000
    }
  }
}
```

---

## Environment Variables

```bash
# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Browserbase (optional, for cloud testing)
BROWSERBASE_API_KEY=...
BROWSERBASE_PROJECT_ID=...

# Stagehand Options
STAGEHAND_MODEL=anthropic/claude-3-5-sonnet-20241022
STAGEHAND_VERBOSE=false
```

---

## Success Metrics

### Phase 1
- ✅ Stagehand initializes successfully
- ✅ Element discovery returns actionable results
- ✅ Integration doesn't break existing functionality

### Phase 2
- ✅ Detects at least 5 common ARIA patterns
- ✅ Validates pattern completeness accurately
- ✅ Generates helpful pattern-specific recommendations

### Phase 3
- ✅ Tab order testing completes without errors
- ✅ Detects tab order mismatches
- ✅ Identifies focus trap issues

### Phase 4
- ✅ Completes at least 2 user flow tests
- ✅ Tracks accessibility throughout flows
- ✅ Generates flow-based recommendations

### Phase 5
- ✅ Unified report combines all findings
- ✅ Accessibility score is accurate and helpful
- ✅ Recommendations are actionable

---

## Dependencies

```json
{
  "dependencies": {
    "@browserbasehq/stagehand": "^3.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

---

## Cost Considerations

### API Usage
- **Element Discovery**: ~500-1000 tokens per page
- **Pattern Detection**: ~1000-2000 tokens per page
- **Keyboard Testing**: ~200-500 tokens per test
- **Flow Testing**: ~2000-5000 tokens per flow

### Estimated Costs (per scan)
- **Basic Scan**: $0.01 - $0.05
- **Full Scan with Patterns**: $0.05 - $0.15
- **Complete Deep Scan**: $0.15 - $0.30

### Cost Optimization
- Cache element discoveries
- Batch pattern detections
- Use cheaper models for simple tasks
- Implement result caching

---

## Future Enhancements

### Phase 6+
- [ ] Visual regression testing for accessibility
- [ ] Multi-page site crawling
- [ ] Custom pattern definitions
- [ ] Integration with CI/CD pipelines
- [ ] Real screen reader testing (via cloud services)
- [ ] Automated fix generation
- [ ] Learning from past scans
- [ ] Team collaboration features

---

## Resources

- [Stagehand Documentation](https://docs.stagehand.dev)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Accessibility Testing Tools](https://www.w3.org/WAI/test-evaluate/tools/)

---

## Questions & Decisions

### To Decide
- [ ] Which AI model to use as default?
- [ ] Should Stagehand be optional or required?
- [ ] How to handle API key management?
- [ ] What's the timeout strategy for slow pages?
- [ ] How to cache results effectively?

### Open Questions
- How to test Stagehand integration in CI?
- Should we support Browserbase for cloud testing?
- How to handle dynamic/SPA applications?
- What's the best way to visualize tab order?

---

## Getting Started

Once implemented, users can start with:

```bash
# Install with Stagehand support
npm install -g react-a11y-scanner

# Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run first scan
npx react-a11y-scanner http://localhost:3000 --stagehand

# Review results
cat accessibility-report.json
```

---

**Last Updated**: 2025-11-23  
**Status**: Planning Phase  
**Next Steps**: Begin Phase 1 implementation
