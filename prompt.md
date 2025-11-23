# Accessibility Violations - AI Fix Prompt

# Accessibility Fix Request

You are an expert React developer and accessibility specialist.
I need you to fix ALL accessibility violations in my application.

## Scan Context
**URL:** file:///Users/justinirizarry/Developer/react-a11y-scanner/test/fixtures/test-app.html

### Summary
- **Total Components:** 35
- **Components with Issues:** 7
- **Total Violations:** 16

### Violations by Severity
- Critical: 3
- Serious: 1
- Moderate: 3

## Detailed Violations
### 1. color-contrast (serious)

**Description:** Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
**Help:** [Elements must meet minimum color contrast ratio thresholds](https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=axeAPI)

**Component Path:** `div > LoginForm > div > form > button`
**Selector:** `div.card > form > button`

**HTML Element:**
```html
<button>Submit</button>
```

**Failure Summary:**
> Fix any of the following:
>   Element has insufficient color contrast of 3.97 (foreground color: #ffffff, background color: #007bff, font size: 10.0pt (13.3333px), font weight: normal). Expected contrast ratio of 4.5:1

**How to Fix:**
Increase color contrast

**Example:**
```jsx
// ❌ Bad: Low contrast (e.g., #999 on #fff = 2.8:1)
color: #999999;
background: #ffffff;

// ✅ Good: High contrast (e.g., #595959 on #fff = 7:1)
color: #595959;
background: #ffffff;
```

*Found in 3 instances total.*

---

### 2. image-alt (critical)

**Description:** Ensure <img> elements have alternative text or a role of none or presentation
**Help:** [Images must have alternative text](https://dequeuniversity.com/rules/axe/4.11/image-alt?application=axeAPI)

**Component Path:** `div > ImageGallery > div > img`
**Selector:** `div > div.card.image-container > img`

**HTML Element:**
```html
<img src="https://via.placeholder.com/150" width="150" height="150">
```

**Failure Summary:**
> Fix any of the following:
>   Element does not have an alt attribute
>   aria-label attribute does not exist or is empty
>   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
>   Element has no title attribute
>   Element's default semantics were not overridden with role="none" or role="presentation"

**How to Fix:**
Add alt text to the image

**Example:**
```jsx
// ❌ Bad: Missing alt
<img src="logo.png" />

// ✅ Good: Descriptive alt for meaningful image
<img src="logo.png" alt="Company Name Logo" />

// ✅ Good: Empty alt for decorative image
<img src="decoration.png" alt="" />
```

---

### 3. label (critical)

**Description:** Ensure every form element has a label
**Help:** [Form elements must have labels](https://dequeuniversity.com/rules/axe/4.11/label?application=axeAPI)

**Component Path:** `div > LoginForm > div > form > div > input`
**Selector:** `form > div > input`

**HTML Element:**
```html
<input type="email" value="">
```

**Failure Summary:**
> Fix any of the following:
>   Element does not have an implicit (wrapped) <label>
>   Element does not have an explicit <label>
>   aria-label attribute does not exist or is empty
>   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
>   Element has no title attribute
>   Element has no placeholder attribute
>   Element's default semantics were not overridden with role="none" or role="presentation"

**How to Fix:**
Add a label to the form input

**Example:**
```jsx
// ❌ Bad: No label
<input type="email" />

// ✅ Good: With label element
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Good: With aria-label
<input type="email" aria-label="Email address" />
```

*Found in 2 instances total.*

---

### 4. landmark-one-main (moderate)

**Description:** Ensure the document has a main landmark
**Help:** [Document should have one main landmark](https://dequeuniversity.com/rules/axe/4.11/landmark-one-main?application=axeAPI)

**Component Path:** `Unknown`
**Selector:** `html`

**HTML Element:**
```html
<html lang="en">
```

**Failure Summary:**
> Fix all of the following:
>   Document does not have a main landmark

**How to Fix:**
Add a <main> landmark to your page

**Example:**
```jsx
<main>
  {/* Your page content here */}
</main>
```

---

### 5. page-has-heading-one (moderate)

**Description:** Ensure that the page, or at least one of its frames contains a level-one heading
**Help:** [Page should contain a level-one heading](https://dequeuniversity.com/rules/axe/4.11/page-has-heading-one?application=axeAPI)

**Component Path:** `Unknown`
**Selector:** `html`

**HTML Element:**
```html
<html lang="en">
```

**Failure Summary:**
> Fix all of the following:
>   Page must have a level-one heading

**How to Fix:**
Add an <h1> heading to your page

**Example:**
```jsx
<h1>Page Title</h1>
```

---

### 6. region (moderate)

**Description:** Ensure all page content is contained by landmarks
**Help:** [All page content should be contained by landmarks](https://dequeuniversity.com/rules/axe/4.11/region?application=axeAPI)

**Component Path:** `div > Header > div`
**Selector:** `div > div > div.card`

**HTML Element:**
```html
<div class="card"><div style="font-size: 24px; font-weight: bold;">Welcome to Test App</div></div>
```

**Failure Summary:**
> Fix any of the following:
>   Some page content is not contained by landmarks

**How to Fix:**
Wrap content in semantic landmarks

**Example:**
```jsx
<main>
  <section>
    {/* Content */}
  </section>
</main>
```

*Found in 7 instances total.*

---

### 7. select-name (critical)

**Description:** Ensure select element has an accessible name
**Help:** [Select element must have an accessible name](https://dequeuniversity.com/rules/axe/4.11/select-name?application=axeAPI)

**Component Path:** `div > ColorPicker > div > select`
**Selector:** `div > div.card > select`

**HTML Element:**
```html
<select><option>Red</option><option>Blue</option><option>Green</option></select>
```

**Failure Summary:**
> Fix any of the following:
>   Element does not have an implicit (wrapped) <label>
>   Element does not have an explicit <label>
>   aria-label attribute does not exist or is empty
>   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
>   Element has no title attribute
>   Element's default semantics were not overridden with role="none" or role="presentation"


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