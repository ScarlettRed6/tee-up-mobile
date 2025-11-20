# TeeUp Admin Dashboard - Styling Guide & Prompt

## 🎨 DESIGN SYSTEM REFERENCE

Use this styling guide to create a consistent admin dashboard web app that matches the TeeUp mobile app's design language.

---

## 📐 COLOR PALETTE

### Primary Colors
- **Primary Accent**: `#FF6B35` (Orange/Coral) - Used for CTAs, active states, highlights, badges
- **Background Primary**: `#F6EDE2` (Beige/Cream) - Main background color
- **Background Secondary**: `#FAF1E6` (Lighter Beige) - Alternative background, login/signup screens
- **White**: `#FFFFFF` - Cards, buttons, input backgrounds

### Text Colors
- **Primary Text**: `#000000` (Black) - Main headings, important text
- **Secondary Text**: `#121212` / `#1a1a1a` / `#222222` - Body text, labels
- **Tertiary Text**: `#333333` - Subtitles, descriptions
- **Muted Text**: `#666666` - Secondary information, hints
- **Disabled Text**: `#999999` - Disabled states, placeholders
- **Light Text**: `#777777` - Additional muted text

### Grayscale & Utility Colors
- **Border Color**: `#E0E0E0` - Borders, dividers
- **Light Gray**: `#F3F3F3` - Pill/tag backgrounds, inactive states
- **Medium Gray**: `#F5F5F5` - Image placeholders, input backgrounds
- **Dark Gray**: `#666666` - Selected pill/tag background
- **Disabled Background**: `#E0E0E0` - Disabled buttons, inputs

### Status Colors (Optional - for admin dashboard)
- **Success**: `#10B981` (Green) - Success states, approvals
- **Warning**: `#F59E0B` (Yellow) - Warnings, pending states
- **Error**: `#EF4444` (Red) - Errors, rejections, bans
- **Info**: `#3B82F6` (Blue) - Information, info badges

---

## 🔤 TYPOGRAPHY

### Font Family
- **Primary Font**: `Exo` (Google Fonts)
  - **Regular**: `Exo_400Regular` - Body text, descriptions
  - **Medium**: `Exo_500Medium` - Labels, buttons, secondary headings
  - **SemiBold**: `Exo_600SemiBold` - Subheadings, emphasized text
  - **Bold**: `Exo_700Bold` - Main headings, important text, buttons
  - **Italic**: `Exo_400Regular_Italic` - Emphasis, quotes, subtitles

### Font Sizes (Web - scale up from mobile)
- **H1/Page Title**: `32px` (Bold) - Main page titles
- **H2/Section Title**: `24px` (Bold) - Section headings
- **H3/Subsection**: `20px` (SemiBold) - Subsection headings
- **H4/Card Title**: `18px` (SemiBold) - Card titles, product names
- **Body Large**: `16px` (Regular) - Body text, descriptions
- **Body**: `14px` (Regular) - Default body text
- **Body Small**: `13px` (Regular) - Secondary text, labels
- **Caption**: `12px` (Regular) - Small text, hints, timestamps
- **Tiny**: `10px` (Regular) - Navigation labels, badges

### Font Weights
- **Regular (400)**: Body text, descriptions, labels
- **Medium (500)**: Buttons, secondary headings, emphasized labels
- **SemiBold (600)**: Subheadings, card titles, important text
- **Bold (700)**: Main headings, buttons, important emphasis

### Line Heights
- **Tight**: `1.2` - Headings
- **Normal**: `1.5` - Body text
- **Relaxed**: `1.6` - Descriptions, long text

---

## 📏 SPACING SYSTEM

Use a consistent 4px base unit spacing system:

- **XS**: `4px` - Tight spacing, icon padding
- **SM**: `8px` - Small gaps, tight spacing
- **MD**: `12px` - Default spacing, card padding
- **LG**: `16px` - Standard spacing, section gaps
- **XL**: `20px` - Large spacing, section margins
- **2XL**: `24px` - Extra large spacing, page padding
- **3XL**: `28px` - Very large spacing, section separations
- **4XL**: `32px` - Huge spacing, major sections
- **5XL**: `48px` - Maximum spacing, page sections

### Common Spacing Patterns
- **Card Padding**: `12px` - `16px`
- **Section Margin**: `24px` - `32px`
- **Page Padding**: `20px` - `24px`
- **Input Padding**: `14px` - `16px` vertical, `16px` horizontal
- **Button Padding**: `14px` vertical, `20px` - `24px` horizontal

---

## 🎭 BORDER RADIUS

- **Small**: `8px` - Small elements, tags
- **Medium**: `12px` - Cards, inputs, images
- **Large**: `16px` - Large cards, containers
- **Pill**: `20px` - Pills, tags, filters
- **Button**: `28px` - Primary buttons (rounded)
- **Circle**: `50%` - Avatars, circular buttons

### Common Border Radius Usage
- **Cards**: `12px` - `16px`
- **Inputs**: `12px`
- **Buttons**: `12px` (standard) or `28px` (primary/rounded)
- **Pills/Tags**: `20px`
- **Avatars**: `50%` (circular)
- **Modals**: `16px` - `20px`

---

## shadow SYSTEM

### Shadow Styles
All shadows use black (`#000000`) with low opacity for subtle depth.

#### Card Shadow (Default)
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
```
- **Opacity**: `0.08`
- **Blur**: `8px`
- **Offset**: `0px 2px`
- **Usage**: Cards, containers, elevated elements

#### Button Shadow (Primary)
```css
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
```
- **Opacity**: `0.12`
- **Blur**: `8px`
- **Offset**: `0px 4px`
- **Usage**: Primary buttons, important actions

#### Modal Shadow (Elevated)
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
```
- **Opacity**: `0.25`
- **Blur**: `12px`
- **Offset**: `0px 4px`
- **Usage**: Modals, dropdowns, elevated overlays

#### Nav Bar Shadow (Top)
```css
box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
```
- **Opacity**: `0.05`
- **Blur**: `8px`
- **Offset**: `0px -2px`
- **Usage**: Bottom navigation, top bars

#### Subtle Shadow (Light)
```css
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
```
- **Opacity**: `0.08`
- **Blur**: `4px`
- **Offset**: `0px 2px`
- **Usage**: Pills, tags, small elevated elements

---

## 🎴 COMPONENT STYLES

### Cards
```css
background-color: #FFFFFF;
border-radius: 12px; /* or 16px for larger cards */
padding: 12px; /* or 16px */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
```

### Buttons

#### Primary Button (White)
```css
background-color: #FFFFFF;
border-radius: 28px; /* Rounded */
padding: 14px 24px;
font-family: 'Exo', sans-serif;
font-weight: 700; /* Bold */
font-size: 18px;
color: #111111;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
border: none;
cursor: pointer;
```

#### Primary Button (Colored - Orange)
```css
background-color: #FF6B35;
border-radius: 28px; /* or 12px for square */
padding: 14px 24px;
font-family: 'Exo', sans-serif;
font-weight: 600; /* SemiBold */
font-size: 16px;
color: #FFFFFF;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
border: none;
cursor: pointer;
```

#### Secondary Button
```css
background-color: #F3F3F3;
border-radius: 12px;
padding: 10px 20px;
font-family: 'Exo', sans-serif;
font-weight: 500; /* Medium */
font-size: 14px;
color: #000000;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
border: none;
cursor: pointer;
```

#### Disabled Button
```css
background-color: #E0E0E0;
color: #999999;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
cursor: not-allowed;
```

### Input Fields
```css
background-color: #FFFFFF;
border-radius: 12px;
padding: 14px 16px;
font-family: 'Exo', sans-serif;
font-weight: 400; /* Regular */
font-size: 16px;
color: #222222;
border: none;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
outline: none;
```

#### Input Focus State
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
/* Optional: add border */
border: 1px solid #FF6B35;
```

#### Input Placeholder
```css
color: #999999;
opacity: 0.8;
```

### Pills/Tags
```css
background-color: #F3F3F3;
border-radius: 20px;
padding: 10px 20px;
font-family: 'Exo', sans-serif;
font-weight: 500; /* Medium */
font-size: 13px;
color: #000000;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
border: none;
```

#### Selected Pill
```css
background-color: #666666;
color: #FFFFFF;
```

### Search Bar
```css
background-color: #FFFFFF;
border-radius: 24px;
padding: 12px 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
display: flex;
align-items: center;
gap: 10px;
```

### Badges
```css
background-color: #FF6B35;
color: #FFFFFF;
padding: 4px 8px;
border-radius: 4px;
font-family: 'Exo', sans-serif;
font-weight: 700; /* Bold */
font-size: 10px;
text-transform: uppercase;
```

### Status Badges (Admin Dashboard)
- **Active**: Green background (`#10B981`), white text
- **Pending**: Yellow background (`#F59E0B`), white text
- **Suspended**: Orange background (`#FF6B35`), white text
- **Banned**: Red background (`#EF4444`), white text
- **Inactive**: Gray background (`#999999`), white text

### Modals
```css
background-color: #FFFFFF;
border-radius: 20px; /* or 16px */
padding: 24px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
max-width: 400px; /* or as needed */
width: 85%; /* responsive */
```

### Modal Overlay
```css
background-color: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px); /* optional */
```

### Tables (Admin Dashboard)
```css
background-color: #FFFFFF;
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
overflow: hidden;
```

#### Table Header
```css
background-color: #F6EDE2;
padding: 16px;
font-family: 'Exo', sans-serif;
font-weight: 600; /* SemiBold */
font-size: 14px;
color: #000000;
border-bottom: 1px solid #E0E0E0;
```

#### Table Row
```css
padding: 16px;
border-bottom: 1px solid #E0E0E0;
font-family: 'Exo', sans-serif;
font-weight: 400; /* Regular */
font-size: 14px;
color: #222222;
```

#### Table Row Hover
```css
background-color: #FAF1E6;
```

### Dropdown Menus
```css
background-color: #FFFFFF;
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
padding: 4px;
min-width: 180px;
```

#### Dropdown Item
```css
padding: 10px 16px;
font-family: 'Exo', sans-serif;
font-weight: 400; /* Regular */
font-size: 14px;
color: #000000;
border-radius: 8px;
cursor: pointer;
```

#### Dropdown Item Hover
```css
background-color: #F6EDE2;
```

---

## 🏗️ LAYOUT STRUCTURE

### Page Container
```css
background-color: #F6EDE2;
min-height: 100vh;
padding: 24px;
```

### Sidebar Navigation
```css
background-color: #FFFFFF;
width: 260px; /* or as needed */
min-height: 100vh;
box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
padding: 24px;
```

### Main Content Area
```css
flex: 1;
padding: 24px;
background-color: #F6EDE2;
```

### Header/Nav Bar
```css
background-color: #FFFFFF;
padding: 16px 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
border-bottom: 1px solid #E0E0E0;
```

### Section Container
```css
margin-bottom: 32px;
```

### Section Title
```css
font-family: 'Exo', sans-serif;
font-weight: 600; /* SemiBold */
font-size: 18px;
color: #000000;
margin-bottom: 16px;
```

---

## 🎯 SPECIFIC ADMIN DASHBOARD COMPONENTS

### Metric Cards
```css
background-color: #FFFFFF;
border-radius: 16px;
padding: 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
```

#### Metric Value
```css
font-family: 'Exo', sans-serif;
font-weight: 700; /* Bold */
font-size: 32px;
color: #000000;
margin-bottom: 8px;
```

#### Metric Label
```css
font-family: 'Exo', sans-serif;
font-weight: 400; /* Regular */
font-size: 14px;
color: #666666;
```

### Filter Bar
```css
background-color: #FFFFFF;
border-radius: 12px;
padding: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
margin-bottom: 24px;
display: flex;
gap: 12px;
align-items: center;
flex-wrap: wrap;
```

### Action Buttons (Table)
```css
background-color: transparent;
border: none;
padding: 8px;
border-radius: 8px;
cursor: pointer;
color: #666666;
```

#### Action Button Hover
```css
background-color: #F6EDE2;
color: #000000;
```

### Status Indicators
- Use colored badges (see Badges section)
- Green for active/approved
- Yellow for pending
- Orange for warning/suspended
- Red for banned/rejected
- Gray for inactive

### Empty States
```css
text-align: center;
padding: 40px;
color: #999999;
font-family: 'Exo', sans-serif;
font-weight: 400; /* Regular */
font-size: 16px;
```

---

## 🎨 DESIGN PRINCIPLES

### Visual Hierarchy
1. **Primary Actions**: Use white buttons with bold text and shadows
2. **Secondary Actions**: Use gray pills or outlined buttons
3. **Important Information**: Use bold headings and larger fonts
4. **Secondary Information**: Use muted colors and smaller fonts

### Consistency
- Use consistent spacing (4px base unit)
- Use consistent border radius (12px for cards, 28px for primary buttons)
- Use consistent shadows (0.08 opacity for cards, 0.12 for buttons)
- Use consistent colors (beige backgrounds, white cards, orange accents)

### Accessibility
- Ensure sufficient color contrast (WCAG AA compliance)
- Use clear typography hierarchy
- Provide focus states for interactive elements
- Use semantic HTML elements

### Responsiveness
- Use flexible layouts (flexbox/grid)
- Responsive spacing and padding
- Mobile-first approach (scale up for desktop)
- Breakpoints: Mobile (320px+), Tablet (768px+), Desktop (1024px+)

---

## 📝 IMPLEMENTATION CHECKLIST

### Colors
- [ ] Primary accent color: `#FF6B35`
- [ ] Background colors: `#F6EDE2`, `#FAF1E6`
- [ ] Text colors: `#000`, `#333`, `#666`, `#999`
- [ ] Border color: `#E0E0E0`
- [ ] Status colors (success, warning, error, info)

### Typography
- [ ] Exo font family imported
- [ ] Font weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- [ ] Font sizes: 10px - 32px scale
- [ ] Line heights: 1.2 (headings), 1.5 (body)

### Spacing
- [ ] 4px base unit spacing system
- [ ] Consistent padding: 12px, 16px, 20px, 24px
- [ ] Consistent margins: 16px, 24px, 32px

### Components
- [ ] Cards with white background and shadows
- [ ] Buttons (primary, secondary, disabled)
- [ ] Input fields with rounded corners
- [ ] Pills/tags with rounded corners
- [ ] Modals with overlay
- [ ] Tables with proper styling
- [ ] Dropdown menus
- [ ] Badges and status indicators

### Shadows
- [ ] Card shadows: `0 2px 8px rgba(0, 0, 0, 0.08)`
- [ ] Button shadows: `0 4px 8px rgba(0, 0, 0, 0.12)`
- [ ] Modal shadows: `0 4px 12px rgba(0, 0, 0, 0.25)`

### Border Radius
- [ ] Cards: 12px - 16px
- [ ] Buttons: 12px or 28px (rounded)
- [ ] Pills: 20px
- [ ] Inputs: 12px
- [ ] Modals: 16px - 20px

---

## 🚀 QUICK START CSS VARIABLES

```css
:root {
  /* Colors */
  --color-primary: #FF6B35;
  --color-bg-primary: #F6EDE2;
  --color-bg-secondary: #FAF1E6;
  --color-white: #FFFFFF;
  --color-text-primary: #000000;
  --color-text-secondary: #333333;
  --color-text-muted: #666666;
  --color-text-disabled: #999999;
  --color-border: #E0E0E0;
  --color-gray-light: #F3F3F3;
  --color-gray-medium: #F5F5F5;
  --color-gray-dark: #666666;
  
  /* Status Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Typography */
  --font-family: 'Exo', sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 28px;
  --spacing-4xl: 32px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 20px;
  --radius-button: 28px;
  --radius-circle: 50%;
  
  /* Shadows */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-button: 0 4px 8px rgba(0, 0, 0, 0.12);
  --shadow-modal: 0 4px 12px rgba(0, 0, 0, 0.25);
  --shadow-nav: 0 -2px 8px rgba(0, 0, 0, 0.05);
}
```

---

## 📋 USAGE EXAMPLE

```css
/* Card Component */
.card {
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
}

/* Primary Button */
.btn-primary {
  background-color: var(--color-white);
  border-radius: var(--radius-button);
  padding: 14px var(--spacing-2xl);
  font-family: var(--font-family);
  font-weight: var(--font-weight-bold);
  font-size: 18px;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-button);
  border: none;
  cursor: pointer;
}

/* Input Field */
.input {
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  padding: 14px var(--spacing-lg);
  font-family: var(--font-family);
  font-weight: var(--font-weight-regular);
  font-size: 16px;
  color: var(--color-text-secondary);
  border: none;
  box-shadow: var(--shadow-card);
  outline: none;
}

/* Pill/Tag */
.pill {
  background-color: var(--color-gray-light);
  border-radius: var(--radius-pill);
  padding: 10px var(--spacing-xl);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  font-size: 13px;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-card);
  border: none;
}
```

---

## 🎯 FINAL NOTES

1. **Consistency is Key**: Maintain consistent spacing, colors, and typography throughout the admin dashboard
2. **Mobile App Alignment**: The admin dashboard should feel like a natural extension of the mobile app
3. **Professional Yet Friendly**: The beige/cream background and orange accents create a warm, approachable feel while maintaining professionalism
4. **Accessibility**: Ensure all interactive elements have proper focus states and sufficient color contrast
5. **Responsive Design**: Design for desktop first, but ensure it works on tablets and larger mobile devices

---

**Use this guide as your reference when styling the TeeUp Admin Dashboard Web App!** 🎨



















