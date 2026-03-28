# Accessibility Fix Request

You are an expert developer and accessibility specialist.
I need you to fix ALL accessibility violations in my application.
Source file locations are provided where available — use them to navigate directly to the code that needs fixing.

## Scan Context
**URL:** https://www.w3.org/WAI/demos/bad/before/home.html

### Summary
- **Total Components:** 0
- **Components with Issues:** 0
- **Violated Rules:** 8
- **Total Instances:** 69

### Rules by Severity
- Critical: 2
- Serious: 4
- Moderate: 2

> 23 accessibility rules are passing.
> 1 items need manual review (not included below).

## Detailed Violations
### 1. color-contrast (serious)

**Description:** Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
**Help:** [Elements must meet minimum color contrast ratio thresholds](https://dequeuniversity.com/rules/axe/4.8/color-contrast?application=axeAPI)
**WCAG Criteria:** 1.4.3 Contrast (Minimum) (AA)
**Principle:** Perceivable

**Failure Summary:**
> Fix any of the following:
>   Element has insufficient color contrast of 3.88 (foreground color: #41545d, background color: #a9b8bf, font size: 9.8pt (13px), font weight: bold). Expected contrast ratio of 4.5:1

**All Instances (2):**
1. `Unknown` - tr[height="25px"]:nth-child(2) > td[bgcolor="#A9B8BF"][width="150px"] > font[color="#41545D"][size="2"] > b
2. `Unknown` - tr[height="25px"]:nth-child(7) > td[bgcolor="#A9B8BF"][width="150px"] > font[color="#41545D"][size="2"] > b

---

### 2. html-has-lang (serious)

**Description:** Ensures every HTML document has a lang attribute
**Help:** [`<html>` element must have a lang attribute](https://dequeuniversity.com/rules/axe/4.8/html-has-lang?application=axeAPI)
**WCAG Criteria:** 3.1.1 Language of Page (A)
**Principle:** Understandable

**Failure Summary:**
> Fix any of the following:
>   The `<html>` element does not have a lang attribute

---

### 3. image-alt (critical)

**Description:** Ensures `<img>` elements have alternate text or a role of none or presentation
**Help:** [Images must have alternate text](https://dequeuniversity.com/rules/axe/4.8/image-alt?application=axeAPI)
**WCAG Criteria:** 1.1.1 Non-text Content (A)
**Principle:** Perceivable

**Failure Summary:**
> Fix any of the following:
>   Element does not have an alt attribute
>   aria-label attribute does not exist or is empty
>   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
>   Element has no title attribute
>   Element's default semantics were not overridden with role="none" or role="presentation"

**All Instances (33):**
1. `Unknown` - img[src$="border_left_top.gif"]
2. `Unknown` - img[src$="border_top.gif"]
3. `Unknown` - img[src$="border_right_top.gif"]
4. `Unknown` - img[src$="border_left.gif"]
5. `Unknown` - img[src$="top_logo_next_end.gif"]
   ... and 28 more

---

### 4. landmark-one-main (moderate)

**Description:** Ensures the document has a main landmark
**Help:** [Document should have one main landmark](https://dequeuniversity.com/rules/axe/4.8/landmark-one-main?application=axeAPI)
**WCAG Criteria:** 1.3.1 Info and Relationships (A)
**Principle:** Perceivable

**Failure Summary:**
> Fix all of the following:
>   Document does not have a main landmark

---

### 5. link-name (serious)

**Description:** Ensures links have discernible text
**Help:** [Links must have discernible text](https://dequeuniversity.com/rules/axe/4.8/link-name?application=axeAPI)
**WCAG Criteria:** 4.1.2 Name, Role, Value (A), 2.4.4 Link Purpose (In Context) (A)

**Failure Summary:**
> Fix all of the following:
>   Element is in tab order and does not have accessible text
> 
> Fix any of the following:
>   Element does not have text that is visible to screen readers
>   aria-label attribute does not exist or is empty
>   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
>   Element has no title attribute

**All Instances (7):**
1. `Unknown` - #home > a[onfocus="blur();"]
2. `Unknown` - #news > a[onfocus="blur();"]
3. `Unknown` - #tickets > a[onfocus="blur();"]
4. `Unknown` - #survey > a[onfocus="blur();"]
5. `Unknown` - .story:nth-child(1) > span > a[href$="news.html"][onfocus="blur();"]
   ... and 2 more

---

### 6. region (moderate)

**Description:** Ensures all page content is contained by landmarks
**Help:** [All page content should be contained by landmarks](https://dequeuniversity.com/rules/axe/4.8/region?application=axeAPI)
**WCAG Criteria:** 1.3.1 Info and Relationships (A)
**Principle:** Perceivable

**Failure Summary:**
> Fix any of the following:
>   Some page content is not contained by landmarks

**All Instances (22):**
1. `Unknown` - #logos
2. `Unknown` - h1
3. `Unknown` - .subline
4. `Unknown` - #mnav
5. `Unknown` - #startcontent
   ... and 17 more

---

### 7. select-name (critical)

**Description:** Ensures select element has an accessible name
**Help:** [Select element must have an accessible name](https://dequeuniversity.com/rules/axe/4.8/select-name?application=axeAPI)
**WCAG Criteria:** 1.3.1 Info and Relationships (A), 3.3.2 Labels or Instructions (A), 4.1.2 Name, Role, Value (A)

**Failure Summary:**
> Fix any of the following:
>   Form element does not have an implicit (wrapped) `<label>`
>   Form element does not have an explicit `<label>`
>   aria-label attribute does not exist or is empty
>   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
>   Element has no title attribute
>   Element's default semantics were not overridden with role="none" or role="presentation"

---

### 8. target-size (serious)

**Description:** Ensure touch target have sufficient size and space
**Help:** [All touch targets must be 24px large, or leave sufficient space](https://dequeuniversity.com/rules/axe/4.8/target-size?application=axeAPI)
**WCAG Criteria:** 2.5.8 Target Size (Minimum) (AA)
**Principle:** Operable

**Failure Summary:**
> Fix any of the following:
>   Target has insufficient size (94px by 20px, should be at least 24px by 24px)
>   Target has insufficient space to its closest neighbors. Safe clickable space has a diameter of 16px instead of at least 24px.

**All Instances (2):**
1. `Unknown` - .inaccessible > .report[href$="home.html"]
2. `Unknown` - .accessible > .report[href$="home.html"]


## Requirements
1. **Fix all violations** — use the source file locations to navigate to and edit the right files
2. Use **semantic HTML** where possible (prefer `<main>`, `<nav>`, `<header>`, `<footer>` over `<div>`)
3. Add **ARIA attributes** only when semantic HTML is not sufficient
4. Ensure **keyboard navigation** works correctly
5. Maintain current styling and layout
6. Follow **WCAG 2.1 AA** guidelines

## Deliverables
For each violation:
1. Open the source file at the specified location
2. Apply the fix
3. Briefly explain the change

## Who Benefits
- Screen reader users
- Keyboard-only users
- Users with low vision or color blindness
- Users with motor disabilities