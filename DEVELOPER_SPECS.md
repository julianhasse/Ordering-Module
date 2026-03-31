# Diagnostic Assistant Ordering Module - Developer Specifications

**Version:** 1.0
**Date:** March 30, 2026
**Prepared for:** Developer Handoff

---

## Table of Contents

1. [Overview](#overview)
2. [Application Architecture](#application-architecture)
3. [Design System](#design-system)
4. [Layout & Structure](#layout--structure)
5. [Components Specifications](#components-specifications)
6. [Interactive Behaviors](#interactive-behaviors)
7. [Data Models](#data-models)
8. [States & Validations](#states--validations)
9. [Accessibility](#accessibility)
10. [Bootstrap & CSS Framework](#bootstrap--css-framework)

---

## Overview

### Purpose
A prototype web application for healthcare providers to order laboratory tests. The interface streamlines the ordering process with search, quick selections, favorites, and comprehensive order management.

### Tech Stack
- **HTML5** - Semantic markup
- **CSS3** - Custom styling (no Bootstrap framework, custom components)
- **Vanilla JavaScript** - No external libraries
- **Data Storage** - localStorage for persistence
- **Font** - Google Fonts: Source Sans 3

### Browser Support
Modern browsers (Chrome, Firefox, Safari, Edge)

---

## Application Architecture

### File Structure
```
/Ordering-Module/
  ├── index.html          # Main application file
  ├── styles.css          # All styling (3159 lines)
  ├── app.js             # Application logic
  ├── data.js            # Mock data & API-ready functions
  └── assets/
      ├── header.png      # Header image
      ├── DxA_Logo.png    # Diagnostic Assistant logo
      └── order-tracker.png
```

### State Management
Application state managed in vanilla JS with the following key states:
- `currentOrder[]` - Array of selected tests
- `selectedPriority` - 'routine' | 'stat'
- `orderFasting` - 'n/a' | 'yes' | 'no'
- `orderClinicalComments` - String
- `recentProviders[]` - Array of provider objects
- `PICK_LISTS[]` - Saved test bundles
- `LAB_TESTS[]` - Available tests

---

## Design System

### Colors

#### Primary Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary Blue | `#3A5CE9` | Primary actions, links, active states, borders |
| Dark Blue | `#2D4BD4` | Hover state for primary buttons |
| Navy | `#1A2188` | Test card icons, emphasis elements |
| Success Green | `#3D9B3D` | Success states, confirmation icons |

#### Neutral Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Black | `#333` | Primary text |
| Gray 700 | `#575656` | Secondary text (AA compliant) |
| Gray 600 | `#666` | Tertiary text, labels |
| Gray 500 | `#999` | Placeholder text, disabled states |
| Gray 300 | `#ddd` | Borders, dividers |
| Gray 100 | `#e0e0e0` | Light borders |
| Gray 50 | `#F4F4F4` | Card backgrounds (AA compliant) |
| Background | `#fafafa` | Section backgrounds |
| White | `#fff` | Card surfaces, inputs |
| Body Background | `#f5f5f5` | Page background |

#### Accent Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Error Red | `#c62828` | Error states, required fields, warnings |
| Error Light | `#ffebee` | Error background |
| Warning Yellow | `#ffd700` | Conflict states |
| Warning Light | `#fff9e6` | Conflict backgrounds |
| Star Blue | `#3A5CE9` | Favorite stars (changed from yellow for accessibility) |

### Typography

#### Font Family
```css
font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

#### Font Sizes & Weights
| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| Heading 1 | 20px | 600 | 1.25 | Sidebar headers |
| Heading 2 | 18px | 600 | 1.25 | Section titles, Order count |
| Heading 3 | 16px | 600 | 1.3 | Form section titles |
| Body Large | 16px | 400-500 | 1.5 | Search input, test names |
| Body Medium | 15px | 400-500 | 1.4 | Accordion title, button text |
| Body Default | 14px | 400-500 | 1.5 | Most body text, form labels |
| Body Small | 13px | 400-500 | 1.4 | Secondary info, field values |
| Caption | 12px | 400-500 | 1.3 | Badges, meta info |
| Tiny | 11px | 500 | 1.2 | Field labels (uppercase) |
| Micro | 10px | 600 | 1.2 | Panel tags (uppercase) |

### Spacing System

#### Padding Values
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing, pill padding |
| sm | 6-8px | Button padding vertical |
| md | 10-12px | Input padding, card padding |
| lg | 16px | Section padding, list item spacing |
| xl | 20px | Major section padding, sidebar padding |
| 2xl | 24px | Form section margins |
| 3xl | 32px | Large section spacing |

#### Margin Values
Follow same system as padding

#### Gap Values (Flexbox/Grid)
| Token | Value | Usage |
|-------|-------|-------|
| tight | 4-6px | Inline elements, tags |
| normal | 8px | Form elements |
| relaxed | 12px | Card grids, button groups |
| loose | 16-20px | Major sections |

### Border Radius
| Size | Value | Usage |
|------|-------|-------|
| Small | 4px | Pills, small tags, segmented buttons |
| Medium | 6px | Inputs, buttons, form fields |
| Large | 8px | Cards, modals |
| XL | 12px | Major cards, test cards, pick lists |
| Circle | 50% | Icon buttons, circular avatars, action buttons |

### Shadows
```css
/* Card hover */
box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);

/* Dropdown/Combobox */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Modal */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

/* Bottom bar */
box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
```

### Transitions
```css
/* Standard transition */
transition: all 0.2s ease;

/* Sidebar slide */
transition: transform 0.3s ease;

/* Accordion expand */
transition: max-height 0.3s ease;
```

---

## Layout & Structure

### Container
```css
.container {
    width: 1000px;
    margin: 0 auto;
    background-color: #fff;
    min-height: 100vh;
    height: 100vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
```

### Application Header
- **Height:** Auto (based on image)
- **Width:** 100% (1000px container)
- **Image:** `assets/header.png` - displays full width

### Main Content Area
```css
.app-main {
    display: flex;
    flex: 1;
    min-height: 0;
}
```

### Two-Pane Layout

#### Left Pane (Search & Discovery)
- **Width:** 60% (600px)
- **Background:** `#fafafa`
- **Border Right:** 1px solid #e0e0e0
- **Layout:** Flex column
  - Branding section (56px height including padding)
  - Search header (sticky)
  - Quick selections (scrollable)

#### Right Pane (Order Summary)
- **Width:** 40% (400px)
- **Background:** `#fff`
- **Box Shadow:** -2px 0 8px rgba(0, 0, 0, 0.08)
- **Layout:** Flex column
  - Order Details Accordion (collapsible)
  - Order Header (fixed height ~200px when fasting + clinical comments shown)
  - Order List (scrollable, flex: 1)
  - Bottom Bar (fixed, 70px height)

---

## Components Specifications

### 1. App Branding
**Location:** Top of left pane

**Dimensions:**
- Padding: 16px 20px
- Logo height: 24px
- Background: #fff

**Styling:**
```css
.app-branding-logo {
    height: 24px;
    width: auto;
    object-fit: contain;
}
```

---

### 2. Account Number Selector

**Dimensions:**
- Label font-size: 18px, font-weight: 600
- Input padding: 12px 40px 12px 16px
- Input height: ~48px (with padding)
- Border: 2px solid #ddd
- Border-radius: 8px
- Dropdown arrow: 12px, positioned right: 16px

**States:**
- Default: border #ddd
- Focus: border #3A5CE9, box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1)
- Readonly: cursor pointer

**Dropdown:**
- Background: #fff
- Border: 1px solid #ddd
- Border-radius: 8px
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- Item padding: 12px 16px
- Item hover: background #eef0fc

**Behavior:**
- Initially focused on page load
- Clicking opens dropdown
- Selecting an account enables search field
- Dropdown closes on outside click

---

### 3. Search Input (Omni-Search)

**Dimensions:**
- Padding: 12px 16px
- Font-size: 16px
- Height: ~48px
- Border: 2px solid #ddd
- Border-radius: 8px
- Gap from Account: 16px

**States:**
- Disabled: background #f5f5f5, opacity 0.6, cursor not-allowed
- Focus: border #3A5CE9, box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1)

**Placeholder:**
```
"Search by Test Name, CPT Code, or Alias (e.g., 'Sugar' for Glucose)..."
```

**Search Results Combobox:**
- Position: absolute, top: 100%, margin-top: 4px
- Max-height: 300px
- Scrollable (overflow-y: auto)
- Border-radius: 8px
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

**Combobox Item:**
- Padding: 12px 16px
- Display: flex, justify-content: space-between
- Hover/Highlighted: background #eef0fc
- Border-bottom: 1px solid #f0f0f0 (except last)

**Combobox Item Layout:**
```
[Test Name + CPT Code]     [Favorite Star Icon]
```

- Test name: font-weight 500, color #333
- CPT code: font-size 12px, color #666, margin-left 8px
- Favorite button: 28px × 28px, border-radius 4px

---

### 4. Tabs (Pick Lists / Favorites / Past Orders)

**Dimensions:**
- Tab button padding: 10px 20px
- Font-size: 14px, font-weight: 500
- Border-bottom: 3px solid (active)
- Gap between tabs: 8px
- Bottom border on container: 2px solid #e0e0e0

**States:**
- Inactive: color #666, border transparent
- Hover: color #3A5CE9
- Active: color #3A5CE9, border-bottom-color #3A5CE9

**Content Area:**
- Padding: 20px
- Scrollable (overflow-y: auto)

---

### 5. Quick Selection Chips (Mini View)

**Grid Layout:**
```css
grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
gap: 12px;
```

**Chip Dimensions:**
- Padding: 12px 16px
- Background: #fff
- Border: 1px solid #ddd
- Border-radius: 8px
- Display: flex, align-items: center, justify-content: space-between

**Content:**
- Acronym/Name: font-size 14px, font-weight 500, color #333
- Icon (right): + icon or checkmark badge

**States:**
- Hover: border #3A5CE9, background #eef0fc, transform translateY(-2px), box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2)

**Added Badge (when test is in order):**
- Compact checkmark: 18px circle, border 1px solid #3A5CE9, color #3A5CE9

---

### 6. Test Cards (Detailed View)

**Dimensions:**
- Padding: 14px 16px
- Background: #F4F4F4
- Border: 1px solid #e0e0e0
- Border-radius: 12px
- Gap between elements: 16px

**Layout:**
```
[Icon (48px circle)] [Content (flex: 1)] [Add Button (36px circle)] [Favorite Button (36px)]
```

**Icon:**
- Size: 48px × 48px
- Background: #1A2188 (navy)
- Border-radius: 50%
- SVG icon: 24px × 24px, white

**Content:**
- Test name: 16px, font-weight 600, color #333
- Panel tag: 10px, uppercase, background #e8e8e8, padding 2px 8px, border-radius 12px
- CPT code: 13px, color #575656, font-weight 500
- Category: 13px, color #1A2188, font-weight 500
- Aliases: 13px, color #666, italic

**Add Button:**
- 36px × 36px circle
- Background: #e5e9fc
- Hover: background #3A5CE9, transform scale(1.1), icon color white

**States:**
- Hover: border #3A5CE9, transform translateY(-1px), box-shadow: 0 2px 8px rgba(0, 102, 204, 0.1)

---

### 7. Pick List Cards

**Layout:** Same structure as test cards but with green icon

**Icon:**
- Background: #3D9B3D (green)

**Expandable:**
- Click to expand/collapse
- Expanded section shows list of tests with remove buttons

**Actions:**
- Edit button: 36px circle, border 1px solid #ddd
- Delete button: 36px circle, border 1px solid #ddd, hover: background #ffe6e6, color #cc0000

---

### 8. Past Order Cards

**Icon:**
- Background: #555 (gray)
- Clock icon (SVG)

**Content:**
- Order number: 15px, font-weight 600
- Order date: 13px, color #666

**Actions:**
- Download button: 40px × 40px circle
- Tracker button: 40px × 40px circle
- Reorder button: 40px × 40px circle
- All: border 1px solid #ddd, hover: border #3A5CE9, background #eef0fc

---

### 9. Order Details Accordion

**Header:**
- Padding: 14px 20px
- Background: #fafafa
- Border-bottom: 1px solid #e0e0e0
- Font-size: 15px, font-weight: 600
- Cursor: pointer

**Icon:**
- Chevron (▼): 12px, color #666
- Rotates 180deg when expanded

**Content:**
- Max-height: 500px when expanded (transition: 0.3s ease)
- Overflow-y: auto
- Padding: 20px when expanded
- Scrollbar: 8px width, styled

**NPI Warning Badge:**
- Display: flex, align-items: center, gap: 6px
- Background: #ffebee
- Color: #c62828
- Font-size: 12px
- Padding: 4px 10px
- Border-radius: 4px
- Warning icon: ⚠ (14px)

---

### 10. Form Fields (Order Details)

#### Section Title
- Font-size: 16px, font-weight: 600
- Border-bottom: 2px solid #3A5CE9
- Padding-bottom: 8px
- Margin-bottom: 16px

#### Label
- Font-size: 13px, font-weight: 500
- Color: #333
- Margin-bottom: 6px

#### Input / Select
- Padding: 10px 12px
- Border: 1px solid #ddd
- Border-radius: 6px
- Font-size: 14px
- Transition: border-color 0.2s

**Focus State:**
- Border: #3A5CE9
- Box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1)

**Error State (NPI field):**
- Border: 2px solid #c62828
- Box-shadow: 0 0 0 1px #c62828

#### Form Row (Half/Half Layout)
```css
display: flex;
gap: 12px;
```

- `.form-group-half`: flex: 1
- `.form-group-quarter`: flex: 0.5

#### Checkbox
- Size: 18px × 18px
- Margin: 0
- Cursor: pointer

#### Guarantor Section
- Display: none by default
- Shown when "Add Guarantor" checkbox is checked

---

### 11. Order Header

**Dimensions:**
- Padding: 16px 20px
- Background: #fafafa
- Border-bottom: 1px solid #e0e0e0

**Title:**
- Font-size: 18px, font-weight: 600
- Format: "Current Order (X)" where X is count

**Delete Button:**
- Display: inline-flex, align-items: center, gap: 6px
- Font-size: 13px, font-weight: 500
- Color: #3A5CE9
- Background: none, border: none
- SVG icon: 16px × 16px
- Hover: color #2D4BD4

**Priority Toggle:**
- Display: flex, gap: 16px
- Radio buttons with labels
- Font-size: 14px

**Fasting Segmented Control:**
- Display: inline-flex
- Background: #f0f0f0
- Border-radius: 4px
- Padding: 2px
- Buttons: padding 4px 10px, font-size: 12px, min-width: 32px
- Active: background #fff, color #3A5CE9, box-shadow: 0 1px 2px rgba(0,0,0,0.1)

**Clinical Comments:**
- Label: 11px, uppercase, font-weight: 500, color #666, letter-spacing: 0.5px
- Textarea:
  - Width: 100%
  - Height: 36px
  - Padding: 6px 10px
  - Border: 1px solid #ddd
  - Border-radius: 4px
  - Font-size: 13px
  - Focus: border #3A5CE9, box-shadow: 0 0 0 2px rgba(58, 92, 233, 0.15)

**Separator:**
- Margin: 12px 0 8px
- Border-top: 1px solid #e0e0e0

---

### 12. Order List Items

**Card:**
- Padding: 16px
- Margin-bottom: 12px
- Background: #fafafa
- Border: 1px solid #e0e0e0
- Border-radius: 8px

**Header Layout:**
```
[Test Name (flex: 1)] [Edit Button (28px)] [Remove Button (28px)]
```

**Test Name:**
- Font-weight: 500, color #333

**Edit Button:**
- Size: 28px × 28px
- Border: 1px solid #ddd
- Border-radius: 4px
- Content: "⋮" (three dots)
- Font-size: 16px, font-weight: 600
- Hover: border #3A5CE9, background #eef0fc, color #3A5CE9

**Required Badge (OmniSeq):**
- Position: absolute, top: -3px, right: -3px
- Size: 10px circle
- Background: #c62828

**Remove Button:**
- Padding: 4px 8px
- Font-size: 18px
- Color: #999
- Hover: color #cc0000, background #ffe6e6

**Expandable Details:**
- Max-height: 500px when expanded
- Transition: max-height 0.3s ease

**Field Labels:**
- Font-size: 10px
- Uppercase
- Font-weight: 500
- Color: #666
- Letter-spacing: 0.5px

**Field Inputs:**
- Padding: 8px 10px
- Font-size: 13px
- Border: 1px solid #ddd
- Border-radius: 4px

**Diagnosis Code Pills:**
- Display: inline-flex
- Padding: 2px 6px 2px 8px
- Background: #fff
- Border: 1px solid #3A5CE9
- Border-radius: 4px
- Font-size: 12px
- Gap: 4px
- Remove button: 16px × 16px, hover: color #c62828

**Add Diagnosis Button:**
- Size: 24px circle
- Background: #e5e9fc
- Color: #3A5CE9
- Font-size: 16px (+ icon)
- Hover: background #3A5CE9, color white, transform scale(1.1)

**OmniSeq Warning Message:**
- Display: flex, align-items: center, gap: 6px
- Font-size: 13px, font-weight: 500
- Color: #c62828
- Margin-top: 6px
- Icon: ⚠ (14px)

**Accordion Toggle:**
- Size: 4px padding
- Color: #666
- Hover: color #3A5CE9
- Icon: ▼ (12px), rotates 180deg when collapsed

---

### 13. Bottom Bar

**Dimensions:**
- Position: sticky, bottom: 0
- Height: ~70px (with padding)
- Padding: 16px 20px
- Background: #fff
- Border-top: 1px solid #e0e0e0
- Box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1)
- Z-index: 100

**Layout:**
```
[Left: Empty space for future cost summary] [Right: Save Draft | Sign & Order]
```

**Ghost Button (Save Draft):**
- Padding: 10px 20px
- Border: 1px solid #ddd
- Border-radius: 6px
- Font-size: 14px, font-weight: 500
- Color: #666
- Background: none
- Hover: border #999, background #f5f5f5

**Primary Button (Sign & Order):**
- Padding: 12px 24px
- Background: #3A5CE9
- Border: none
- Border-radius: 6px
- Font-size: 15px, font-weight: 600
- Color: #fff
- Hover: background #2D4BD4, box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3)
- Active: transform translateY(1px)
- Disabled: background rgba(0, 102, 204, 0.65), cursor not-allowed

**Button Gap:** 12px

---

### 14. Sidebars

#### General Sidebar Structure
- Position: fixed, top: 0
- Width: 500px (review), 450px (edit)
- Max-width: 90vw
- Height: 100%
- Z-index: 10000+
- Transform animation: 0.3s ease

**Overlay:**
- Background: rgba(0, 0, 0, 0.5)
- Transition: opacity 0.3s ease

**Review Sidebar (Order Summary):**
- Slides from right
- Width: 500px

**Edit Sidebar (Test Details):**
- Slides from right
- Width: 450px

**Order Details Sidebar:**
- Slides from left
- Width: 500px

**Past Order Summary Sidebar:**
- Slides from right
- Width: 500px

#### Sidebar Header
- Padding: 20px
- Background: #fafafa
- Border-bottom: 1px solid #e0e0e0
- Font-size: 20px, font-weight: 600

**Close Button:**
- Size: 32px × 32px
- Font-size: 28px
- Color: #999
- Border-radius: 4px
- Hover: color #333, background #f0f0f0

#### Sidebar Body
- Padding: 20px
- Flex: 1
- Overflow-y: auto
- Scrollbar: 8px width, styled

#### Sidebar Footer
- Padding: 16px 20px
- Background: #fafafa
- Border-top: 1px solid #e0e0e0
- Display: flex, justify-content: flex-end, gap: 12px

---

### 15. Review Sidebar (Order Summary)

**Header Icon:**
- Success checkmark: ✓
- Color: #3D9B3D
- Font-size: 20px

**Section Title:**
- Font-size: 15px, font-weight: 600
- Margin-bottom: 10px

**Detail Row (Grid Layout):**
```css
display: grid;
grid-template-columns: 160px 1fr;
gap: 4px 16px;
align-items: baseline;
```

**Label:**
- Width: 160px
- Font-size: 13px, font-weight: 500
- Color: #666
- Padding: 4px 0

**Value:**
- Font-size: 13px
- Color: #333
- Padding: 4px 0
- Line-height: 1.4
- Overflow-wrap: break-word

**Test Item:**
- Padding: 8px 10px
- Background: #f8f9fa
- Border: 1px solid #e0e0e0
- Border-radius: 6px

**Test Name:**
- Font-size: 13px, font-weight: 600

**Test Code:**
- Font-size: 12px, color #999

**ABN Card:**
- Background: #f8f9fa
- Border: 1px solid #e0e0e0
- Border-radius: 8px
- Padding: 16px 16px 14px

**ABN Table:**
- Width: 100%
- Border-collapse: collapse
- Font-size: 12px
- Cell padding: 6px 8px
- Border: 1px solid #e0e0e0
- Header background: #f1f1f1

**Footer Buttons:**
- Cancel: Ghost style
- Submit: Primary style ("Submit & Print PDF")

---

### 16. Edit Sidebar (Test Details)

**Test Name/CPT (Read-only):**
- Background: #f5f5f5
- Color: #666
- Cursor: not-allowed

**Diagnosis Codes Container:**
- Margin-bottom: 10px
- Each code: display flex, gap 8px, margin-bottom 8px

**Diagnosis Input:**
- Flex: 1
- Padding: 8px 10px
- Font-size: 13px
- Shows combobox on focus with ICD-10 suggestions

**Remove Code Button:**
- Size: 32px × 32px
- Border: 1px solid #ddd
- Font-size: 18px
- Color: #999
- Hover: color #cc0000, border #cc0000, background #ffe6e6

**Add Diagnosis Button:**
- Padding: 8px 16px
- Border: 1px dashed #ddd
- Border-radius: 6px
- Font-size: 13px, font-weight: 500
- Color: #666
- Width: 100%
- Hover: border #3A5CE9, color #3A5CE9, background #eef0fc

**Patient Status Select:**
- Options: Non-Hospital Patient, Inpatient, Outpatient

**OmniSeq INSIGHT AOEs:**
- Shown only for OmniSeq® INSIGHT test
- Required fields: red labels, red borders (2px solid #c62828)
- Label color: #c62828
- Input/Select: border 2px solid #c62828
- Focus: box-shadow 0 0 0 1px #c62828

**Disclaimer:**
- Font-size: 12px
- Color: #666
- Padding: 12px
- Background: #f8f9fa
- Border-radius: 6px
- Border-left: 3px solid #3A5CE9

**Upload Supporting Documents:**
- Display: flex, flex-direction: column, gap: 10px
- Trigger button:
  - Padding: 10px 16px
  - Background: #f5f5f5
  - Border: 1px dashed #ccc
  - Border-radius: 8px
  - Hover: border #3A5CE9, background #eef0fc
- Icon: 36px circle, background #e5e9fc, color #3A5CE9
- Hover icon: background #3A5CE9, color white, transform scale(1.1)

---

### 17. Modals

**Overlay:**
- Position: fixed, full viewport
- Background: rgba(0, 0, 0, 0.5)
- Z-index: 10004
- Transition: opacity 0.3s ease

**Modal Content:**
- Width: 90%, max-width: 500px
- Background: #fff
- Border-radius: 8px
- Box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)
- Transform: scale(0.9) initially, scale(1) when open
- Transition: transform 0.3s ease

**Modal Header:**
- Padding: 20px
- Border-bottom: 1px solid #e0e0e0
- Display: flex, justify-content: space-between
- Title: 18px, font-weight: 600

**Close Button:**
- Size: 32px × 32px
- Font-size: 28px
- Color: #999
- Border-radius: 4px
- Hover: color #333, background #f0f0f0

**Modal Body:**
- Padding: 20px
- Flex: 1
- Overflow-y: auto

**Modal Footer:**
- Padding: 16px 20px
- Border-top: 1px solid #e0e0e0
- Display: flex, justify-content: flex-end, gap: 12px

**Pick List Modal:**
- Input for name
- Max-length: 50 characters
- Cancel and Save buttons

**Order Tracker Modal:**
- Max-width: 520px
- Header border-bottom: 4px solid #3A5CE9
- Body: 220px height, background image (order-tracker.png)

---

### 18. Notifications

**Success Notification:**
- Position: fixed, top: 20px, right: 20px
- Background: #3D9B3D
- Color: #fff
- Padding: 16px 20px
- Border-radius: 8px
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)
- Max-width: 400px
- Z-index: 10003
- Transition: all 0.3s ease
- Transform: translateY(-20px) initially, translateY(0) when shown

**Content:**
- Display: flex, align-items: flex-start, gap: 12px
- Icon: 20px, font-weight: bold
- Message: 14px, line-height: 1.5

---

### 19. Custom Tooltip

**Styling:**
- Position: fixed
- Padding: 6px 10px
- Background: #333
- Color: #fff
- Font-size: 12px, font-weight: 500
- Border-radius: 4px
- White-space: nowrap
- Z-index: 100000
- Pointer-events: none
- Transform: translate(-50%, -100%)
- Transition: none (instant)

**Danger Variant:**
- Background: #c00

**Visibility:**
- Opacity: 0, visibility: hidden by default
- Opacity: 1, visibility: visible on hover

---

### 20. Provider Combobox (Recently Used)

**Positioning:**
- Fixed position, positioned at input element
- Min-width: 200px
- Max-height: 280px
- Border-radius: 12px
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

**Item Layout:**
```
[NPI Number (left, bold)] [Provider Name (right)]
```

**Item:**
- Padding: 12px 16px
- Display: flex, justify-content: space-between, gap: 12px
- Font-size: 14px
- Hover: background #eef0fc

**NPI:**
- Font-weight: 600
- Color: #231F20

**Name:**
- Color: #575656
- Flex-shrink: 0

---

### 21. Diagnosis Combobox (ICD-10)

**Positioning:**
- Fixed position, below input
- Min-width: 120px
- Max-height: 200px
- Border-radius: 6px

**Item:**
- Padding: 8px 12px
- Font-size: 13px
- Hover: background #eef0fc

---

### 22. Scrollbars (Webkit)

```css
width: 8px;

/* Track */
background: #f1f1f1;

/* Thumb */
background: #ccc;
border-radius: 4px;

/* Thumb Hover */
background: #999;
```

Applied to:
- `.combobox`
- `.order-list`
- `.quick-selections`
- `.sidebar-body`
- `.accordion-content.expanded`

---

## Interactive Behaviors

### 1. Account Selection Flow
1. Page loads → Account input is focused
2. Click account input → Dropdown opens
3. Select account → Dropdown closes
4. Search field becomes enabled and receives focus
5. Sign & Order button updates to enabled state (if tests exist)

### 2. Search Behavior
- Type in search field → Combobox appears after typing
- Shows up to 10 results
- Keyboard navigation: Arrow Up/Down, Enter to select, Escape to close
- Click result → Test added to current order
- Favorite star click → Toggle favorite state (persisted to localStorage)
- Click outside or blur → Combobox hides after 200ms delay

### 3. Adding Tests
- Click test chip → Test added to order
- Click test card add button → Test added to order
- Click pick list add button → All tests in list added to order
- Visual feedback: Flying animation from source to order count
- Order count increments
- Empty state in order list replaced with test cards

### 4. Order List Management
- Tests collapse by default (showing only name and action buttons)
- Click accordion toggle → Expand to show fields
- Edit button click → Opens edit sidebar
- Remove button click → Removes test from order
- Delete all button → Clears entire order (requires confirmation)

### 5. Diagnosis Codes
- Click + button → Adds input field
- Type in input → Shows ICD-10 combobox with suggestions
- Select code → Fills input
- Displays as pill after entering
- Click X on pill → Removes code
- "Add to All" link → Applies diagnosis codes to all tests in order

### 6. Fasting Control
- Three-button segmented control: N/A | Yes | No
- Click button → Updates order-level fasting
- Applies to all tests in order
- Order-level control in header, test-level removed

### 7. Clinical Comments
- Textarea in order header
- Single row (36px height), auto-resize not implemented
- Applies to entire order

### 8. Priority Toggle
- Radio buttons: Routine (default) | STAT
- Selection applies to entire order

### 9. Order Details Accordion
- Click header → Expands/collapses
- Smooth transition (max-height animation)
- Chevron icon rotates 180deg
- Contains all patient/provider/insurance/order information
- Scrollable when expanded (max-height: 500px)

### 10. NPI Number Field
- Shows smart combobox on focus
- Displays recently used providers (up to 15)
- Keyboard navigation supported
- Selecting provider auto-fills NPI and Provider Name
- Missing/invalid NPI shows warning badge in accordion header and on order item
- Required field validation for OmniSeq tests

### 11. OmniSeq INSIGHT Special Handling
- Edit button shows red three-dots border when required fields incomplete
- Red badge (10px circle) on edit button
- Warning message below test name: "⚠ More information is required"
- Edit sidebar shows required fields with red labels and borders
- All required fields must be completed before submission
- Disclaimer shown at bottom of AOE section

### 12. Save as Pick List
- Click "Save as Pick List" button → Opens modal
- Enter name (max 50 chars) → Click Save
- Pick list saved to localStorage
- Appears in Pick Lists tab
- Can be edited (rename) or deleted
- Expanding pick list shows all tests with remove option

### 13. Past Orders
- Click past order card → Expands to show tests
- Download button → Simulates PDF download
- Tracker button → Opens Order Tracker modal
- Reorder button → Opens Past Order Summary sidebar
- Past Order Summary sidebar shows read-only order details
- "Open PDF" button in footer

### 14. Sign & Order Flow
1. Click "Sign & Order" button → Opens Order Summary (Review Sidebar)
2. Review all details (editable fields)
3. Shows ABN card if applicable
4. Click "Submit & Print PDF" → Closes sidebar
5. Shows success notification (top right, green)
6. Order tracker modal opens automatically
7. Order clears from current order

### 15. Favorites
- Blue star icon indicates favorite
- Click star → Toggle favorite state
- Persisted to localStorage
- Favorites tab shows only favorited tests
- Stars use #3A5CE9 (blue) for accessibility, not yellow

### 16. Tabs Switching
- Click tab → Active content shows, others hide
- Active tab: blue underline, blue text
- Content uses `.active-tab-content` class
- Pick Lists, Favorites, Past Orders each have dedicated content area

### 17. Sidebar Interactions
- Click overlay → Closes sidebar
- Click close button (X) → Closes sidebar
- Sidebar slides in/out with transform animation (0.3s ease)
- Prevents body scroll when open
- Stacked z-indexes: Edit (10000), Order Details (10001), Review (10002)

### 18. Form Interactions
- Tab between fields
- Enter key on inputs moves to next field (native behavior)
- Date inputs use native date picker
- Select dropdowns use native styling
- "Add Guarantor" checkbox toggles guarantor section visibility

### 19. Fly Animation
- When adding test, element flies from source to order count
- CSS keyframe animation: `flyToCart`
- Duration: 0.6s ease-out
- Cloned element, positioned fixed, removed after animation

### 20. Hover States
- All interactive elements have hover states
- Common pattern: border color changes to #3A5CE9, background lightens
- Buttons scale slightly (1.1) on hover
- Transition: 0.2s ease

---

## Data Models

### Lab Test Object
```javascript
{
  id: 'cbc-001',
  name: 'CBC with Differential',
  cptCode: '85025',
  aliases: ['CBC', 'Complete Blood Count', 'Blood Count', 'CBC Diff'],
  requiresSpecimen: false,
  specimenOptions: [],
  category: 'Hematology',
  isFavorite: true,
  isPanel: false,
  panelTests: [],
  estimatedCost: 45.00
}
```

### Order Item Object
```javascript
{
  testId: 'cbc-001',
  test: { /* full test object */ },
  patientStatus: 'outpatient',
  diagnosisCodes: ['E11.9', 'I10'],
  specimen: '',
  fasting: 'n/a', // 'n/a' | 'yes' | 'no'
  // OmniSeq-specific fields (if applicable):
  omniseqTreatingPhysician: '',
  omniseqSampleCollectionSite: '',
  omniseqClinicalInfo: '',
  omniseqTumorType: '',
  omniseqSubmittingSpecimen: '',
  omniseqSpecimenId: '',
  omniseqSpecimenType: 'paraffin-block',
  omniseqBlockQuantity: 'test-best-block'
}
```

### Pick List Object
```javascript
{
  id: 'picklist-1234567890-0.123',
  name: 'Diabetes Workup',
  testIds: ['glucose-001', 'hba1c-001', 'lipid-001'],
  createdAt: '2025-01-15T10:30:00.000Z'
}
```

### Past Order Object
```javascript
{
  orderNumber: 'ORD-10482',
  orderDate: '2025-01-22', // YYYY-MM-DD
  testIds: ['cbc-001', 'bmp-001', 'glucose-001']
}
```

### Provider Object
```javascript
{
  npi: '1234567890', // 10-digit string
  name: 'Dr. Smith, John'
}
```

### ICD-10 Object
```javascript
{
  code: 'E11.9',
  description: 'Type 2 diabetes mellitus without complications'
}
```

---

## States & Validations

### Application States
1. **Initial State** - Account not selected, search disabled
2. **Account Selected** - Search enabled, tests can be added
3. **Order Active** - Tests in order, Sign & Order enabled
4. **Order Submitted** - Success notification, order cleared

### Field Validations

#### Required Fields
- Account Number (must be selected to enable search)
- At least one test in order (to enable Sign & Order)

#### NPI Number
- Format: 10-digit number
- Validation: `/^\d{10}$/`
- Warning shown if empty or invalid when order contains tests

#### OmniSeq INSIGHT Required Fields
All marked with red labels and borders:
- Is treating physician same as ordering physician?
- Sample Collection Date/Time
- What is the tumor type?
- Are you submitting the specimen?
- What is the specimen ID?
- What is the specimen type?
- What should we test if block quantity > 1?

#### Diagnosis Codes
- Format: ICD-10 code (validated against suggestion list)
- Multiple codes allowed per test
- Can apply to all tests via "Add to All" link

#### Form Fields (Order Details Accordion)
- Date of Birth: date input
- Gender: select dropdown
- Phone: tel input (no strict validation implemented)
- Email: email input (no strict validation implemented)
- ZIP Code: maxlength 10
- State: maxlength 2

---

## Accessibility

### ARIA Attributes

#### Account Dropdown
```html
<input role="combobox" aria-expanded="false" aria-haspopup="listbox">
<div role="listbox" aria-label="Account numbers">
```

#### Search Combobox
```html
<input role="combobox" aria-expanded="false" aria-haspopup="listbox">
<div role="listbox" aria-label="Search results">
```

#### Provider Combobox
```html
<input aria-expanded="false" aria-controls="provider-combobox" aria-activedescendant="provider-option-0">
<div role="listbox" aria-label="Recently used providers">
  <div role="option" id="provider-option-0">
```

#### Diagnosis Combobox
```html
<div role="listbox" aria-label="Diagnosis code suggestions">
  <div role="option">
```

#### Order List
```html
<div role="list" aria-label="Selected tests">
```

#### Accordion
```html
<button aria-expanded="false">
  <span class="accordion-icon"></span>
</button>
```

#### Buttons
- All buttons have descriptive `aria-label` attributes
- Icon-only buttons include labels: "Close sidebar", "Delete all tests", etc.

#### Tooltips
```html
<div role="tooltip" aria-hidden="true">
```

### Keyboard Navigation

#### Search Combobox
- **Arrow Down/Up** - Navigate results
- **Enter** - Select highlighted result
- **Escape** - Close combobox

#### Provider Combobox
- **Arrow Down/Up** - Navigate providers
- **Enter** - Select highlighted provider
- **Escape** - Close combobox

#### Tabs
- **Tab** - Focus tab buttons
- **Click/Enter** - Activate tab

#### Accordion
- **Tab** - Focus accordion header
- **Enter/Space** - Expand/collapse

#### Modals
- **Escape** - Close modal
- **Enter** - Submit form (in Pick List modal)

### Focus Management
- Account input receives focus on page load
- After account selection, search input receives focus
- Focus trapped within modals when open
- Visible focus indicators (outline: 2px solid #3A5CE9)

### Color Contrast
All text meets WCAG AA standards:
- Primary text (#333) on white: 12.6:1
- Secondary text (#666) on white: 5.7:1
- Gray-700 (#575656) on gray-50 (#F4F4F4): 4.5:1
- Blue (#3A5CE9) on white: 5.4:1
- Red (#c62828) on white: 6.5:1

### Screen Reader Support
- Semantic HTML elements used throughout
- Proper heading hierarchy (h2, h3)
- Labels associated with form inputs
- ARIA live regions for notifications
- ARIA labels for icon-only buttons

---

## Bootstrap & CSS Framework

### Not Using Bootstrap Framework
This application **does not use Bootstrap**. All components are custom-built with vanilla CSS.

### CSS Architecture

**No Framework** - Pure CSS with BEM-like naming conventions

**File:** `styles.css` (3159 lines)

**Organization:**
1. Global Reset & Base Styles (lines 1-44)
2. Layout (Container, Header, Main) (lines 14-768)
3. Left Pane Components (lines 47-758)
4. Right Pane Components (lines 759-1506)
5. Sidebars (lines 1705-3036)
6. Modals (lines 2088-2194)
7. Utilities (Scrollbars, Tooltips) (lines 1679-3159)

### CSS Patterns

#### Box Model Reset
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

#### Flexbox Layouts
Extensive use of flexbox for component layouts:
```css
.order-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

#### CSS Grid
Used for form layouts and detail rows:
```css
.chips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
```

#### CSS Variables
Not used - all values hardcoded for clarity

#### Naming Conventions
- Component-based: `.order-item`, `.test-card`, `.sidebar-header`
- Modifier classes: `.btn-primary`, `.btn-ghost`, `.test-card-add-btn`
- State classes: `.active`, `.expanded`, `.highlighted`, `.show`, `.open`

#### Responsive (None)
Fixed width design (1000px) - no media queries
Not responsive - designed for desktop use

---

## Implementation Notes

### Data Persistence
- **localStorage** used for:
  - Favorites (`labOrderingFavorites`)
  - Pick Lists (`pickLists`)
  - Recent Providers (`recentProviders`)

### API-Ready Architecture
All data functions in `data.js` are structured to be easily replaced with API calls:
- `searchTests(query)` → GET /api/tests/search?q={query}
- `getTestById(id)` → GET /api/tests/{id}
- `getFavorites()` → GET /api/favorites
- `getPastOrders()` → GET /api/orders/history
- `getPickLists()` → GET /api/pick-lists

### Performance Considerations
- Search debounced (300ms delay)
- Virtual scrolling not implemented (could be added for large lists)
- Image optimization needed for production
- CSS minification recommended for production

### Browser Compatibility
- Modern browsers (ES6+ JavaScript)
- CSS Grid and Flexbox support required
- No polyfills included
- Tested on Chrome (primary)

### Future Enhancements
1. Responsive design for tablet/mobile
2. Print stylesheet for order PDF
3. Drag-and-drop for test reordering
4. Undo/redo functionality
5. Bulk test import
6. Advanced filters
7. Dark mode support

---

## File Checklist for Developers

### Required Files
- ✅ `index.html` - Main application file
- ✅ `styles.css` - All styling
- ✅ `app.js` - Application logic
- ✅ `data.js` - Data layer
- ✅ `assets/header.png` - Header image
- ✅ `assets/DxA_Logo.png` - Diagnostic Assistant logo
- ✅ `assets/order-tracker.png` - Order tracker mockup

### Dependencies
- ✅ Google Fonts: Source Sans 3
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
  ```

### No Build Process
- No npm/package.json
- No bundler (Webpack, Vite, etc.)
- No preprocessors (Sass, Less)
- Pure HTML/CSS/JS - open index.html in browser

---

## Testing Checklist

### Functional Tests
- [ ] Account selection enables search
- [ ] Search returns results
- [ ] Tests can be added to order
- [ ] Favorites can be toggled and persist
- [ ] Pick lists can be created, edited, deleted
- [ ] Past orders can be viewed and reordered
- [ ] Order details accordion expands/collapses
- [ ] NPI combobox shows recent providers
- [ ] Diagnosis code combobox works
- [ ] OmniSeq required fields validated
- [ ] Fasting control updates all tests
- [ ] Clinical comments captured
- [ ] Priority toggle works
- [ ] Sign & Order flow completes
- [ ] Success notification appears
- [ ] Order clears after submission

### UI Tests
- [ ] All hover states work
- [ ] All focus states visible
- [ ] Transitions smooth
- [ ] Sidebars slide correctly
- [ ] Modals open/close
- [ ] Scrollbars styled
- [ ] Tooltips appear on hover

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA attributes correct

### Browser Tests
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Contact & Support

For questions about this specification or implementation details, contact the design team.

**Document Version:** 1.0
**Last Updated:** March 30, 2026
**Status:** Ready for Development Handoff

---

END OF SPECIFICATION DOCUMENT
