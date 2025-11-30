# Accessibility Fix Request

You are an expert React developer and accessibility specialist.
I need you to fix ALL accessibility violations in my application.

## Scan Context
**URL:** https://react.dev

### Summary
- **Total Components:** 2049
- **Components with Issues:** 3
- **Violated Rules:** 2
- **Total Instances:** 5

### Rules by Severity
- Serious: 1
- Moderate: 1

> 41 accessibility rules are passing.
> 2 items need manual review (not included below).

## Detailed Violations
### 1. color-contrast (serious)

**Description:** Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
**Help:** [Elements must meet minimum color contrast ratio thresholds](https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=axeAPI)
**WCAG:** WCAG 2.0 AA, wcag143

**Component Path:** `Unknown`
**Selector:** `div.flex.items-center > div.items-center.justify-center > button.flex.3xl:w-[56rem]`

**HTML Element:**
```html
<button type="button" class="flex 3xl:w-[56rem] 3xl:mx-0 relative ps-4 pe-1 py-1 h-10 bg-gray-30/20 dark:bg-gray-40/20 outline-none focus:outline-link betterhover:hover:bg-opacity-80 pointer items-cen...
```

**Failure Summary:**
> Fix any of the following:
>   Element has insufficient color contrast of 2.2 (foreground color: #99a1b3, background color: #ebedef, font size: 11.3pt (15px), font weight: normal). Expected contrast ratio of 4.5:1

**Specific Issues:**
- Element has insufficient color contrast of 2.2 (foreground color: #99a1b3, background color: #ebedef, font size: 11.3pt (15px), font weight: normal). Expected contrast ratio of 4.5:1

**How to Fix:**
Increase color contrast

**User Impact:** Users with low vision or color blindness cannot read low-contrast text.

**All Instances (4):**
1. `button` - div.flex.items-center > div.items-center.justify-center > button.flex.3xl:w-[56rem]
2. `span` - div.select-none.h-8 > div.w-full.leading-snug > span.text-gray-30
3. `clipPath` - div.select-none.h-8 > div.w-full.leading-snug > span.text-gray-30
4. `stop` - div.select-none.h-8 > div.w-full.leading-snug > span.text-gray-30

---

### 2. heading-order (moderate)

**Description:** Ensure the order of headings is semantically correct
**Help:** [Heading levels should only increase by one](https://dequeuniversity.com/rules/axe/4.11/heading-order?application=axeAPI)
**WCAG:** Best Practice

**Component Path:** `defs > clipPath > link > link > defs > clipPath > defs > linearGradient > stop > stop > linearGradient > stop > stop > linearGradient > stop > stop > clipPath > defs > linearGradient > stop > stop > stop > stop > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > stop > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > stop > radialGradient > stop > stop > stop > stop > linearGradient > stop > stop > stop > stop > defs > linearGradient > stop > stop`
**Selector:** `div.relative.overflow-hidden > div.relative.flex > h4.leading-tight.text-primary`

**HTML Element:**
```html
<h4 class="leading-tight text-primary font-semibold text-3xl lg:text-4xl">Stay true to the web</h4>
```

**Failure Summary:**
> Fix any of the following:
>   Heading order invalid

**Specific Issues:**
- Heading order invalid

**How to Fix:**
Fix heading hierarchy

**User Impact:** Skipped heading levels create confusion about content hierarchy.


## Requirements
1. **Fix all violations** while maintaining existing functionality
2. Use **semantic HTML** where possible (prefer <main>, <nav>, <header>, <footer> over <div>)
3. Add **ARIA attributes** only when semantic HTML is not sufficient
4. Ensure **keyboard navigation** works correctly
5. Maintain current styling and layout
6. Follow **WCAG 2.1 AA** guidelines

## Deliverables
Please provide:
- Updated code for each affected component
- Brief explanation of each change
- Any additional accessibility improvements you recommend

## Focus Areas
- Screen reader users
- Keyboard-only users
- Users with visual impairments
- Users with motor disabilities