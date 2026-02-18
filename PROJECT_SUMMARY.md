# Lab Test Ordering Module — Project Summary

**For project managers**

---

## Overview

The **Lab Test Ordering Module** is a prototype web application for ordering laboratory tests. It supports searching and adding tests, capturing order and patient details, and editing test-specific clinical questions (including specialty workflows such as OmniSeq® INSIGHT). The UI is structured for a fixed-width layout (~1000px) and uses a clear visual hierarchy and validation cues to guide users.

---

## Main Layout & Workflow

- **Left pane (~60%):** Account selection, search, and quick selections (Favorites, Pick Lists, Recent Orders).
- **Right pane (~40%):** Order Details (accordion), current order list (added tests), and primary actions (Sign & Order, Order Summary).
- **Sidebars:** Order Summary (review/submit), Edit Test Details (per-test clinical questions and options).

The flow is: **select account → search or pick tests → add to order → fill Order Details → edit test details as needed → review in Order Summary → submit.**

---

## Features by Area

### Account & Search

- **Account Number:** Required to enable search and ordering. User selects an account from a dropdown; search and Sign & Order are disabled until an account is chosen.
- **Search:** Search by test name, CPT code, or alias (e.g., “Sugar” for Glucose). Combobox with type-ahead suggestions; results show test name, CPT, and optional favorite star. Selecting a result adds the test to the order.

### Quick Selections (Favorites, Pick Lists, Recent Orders)

- **Tabs:** Favorites, Pick Lists, and Recent Orders with Compact vs Full Details view (Full Details is default).
- **Favorites:** User can star tests; starred tests appear in Favorites and show a filled star. State is persisted (e.g., localStorage).
- **Pick Lists:** User-created pick lists only (no specialty panels in this tab). Cards show test count and acronyms (e.g., “3 tests (CBC, BMP)”). Empty state: “No pick lists created.”
- **Recent Orders:** Placeholder for recently ordered tests.
- **“Added” state:** Test cards show an “Added” chip when that test is already in the current order; the chip updates as tests are added or removed.

### Order Details (Accordion)

- **Patient Information:** First Name, Last Name, Date of Birth, Gender. Optional “Add Guarantor” with Guarantor section (name, address, contact, relationship).
- **Provider Information:** Ordering Provider, NPI.
- **NPI validation:** If the order has exactly one test, a **“Confirm NPI Number”** warning (red text and icon) appears in the accordion header. Clicking it expands the accordion, focuses the NPI field, and applies a red stroke to the field for visibility. Red styling is consistent with other validation in the app.
- **Bill Method:** Dropdown (Patient, Client, Private Insurance, Medicaid, Medicare).
- **Order Information:** Order Date, Collection Date/Time, Workman’s Comp, EHR Control Number (optional).

### Current Order (Test Cards, Right Panel)

- **Test cards:** Each added test is a card with test name, collapse/expand for details, edit (⋯) and remove (×) actions.
- **Inline fields:** Diagnosis code (with “Add to all” when populated), Specimen (if required), Fasting (No/Yes/N/A), Special Instructions. Diagnosis code has combobox/autocomplete from a predefined ICD-10 list; placeholder “Enter Diagnosis Code.”
- **Order Summary:** “Order Summary” (with checkmark icon) shows a compact list of tests with CPT and editable diagnosis codes. Primary action: “Submit & Print PDF.”

### Edit Sidebar (Per-Test Details)

- **Opened via** the ⋯ button on a test card. Shows Test Name, CPT, Priority, Diagnosis Codes (ICD-10), and a **“Clinical Questions”** section.
- **Clinical Questions:** Patient Status (dropdown: Non-Hospital Patient, Inpatient, **Outpatient** default) — available for **all tests**, not only OmniSeq.
- **OmniSeq® INSIGHT–specific section:** Shown only when editing OmniSeq INSIGHT. Includes Specimen Source, treating physician same as ordering, Sample Collection Date/Time, Clinical Information, tumor type, submitting specimen, specimen ID, specimen type, block quantity, plus disclaimer. **Required fields** are marked with a red asterisk and red label/control stroke for consistency with NPI validation.
- **Other:** Priority, diagnosis codes, special instructions, frequency/dates, upload supporting documents (file list), etc. Data is saved back to the order item on Save.

### OmniSeq Card — Required-Fields Hint

- **Before the Edit sidebar is opened:** The OmniSeq test card shows a **red three-dots (⋯) button** and a **red warning icon (⚠)** to signal required fields in the Edit sidebar.
- **After the user opens the Edit sidebar once** for that OmniSeq test, the three-dots return to normal (black/gray) and the warning icon is removed for the rest of the session.

### Sign & Order and Validation

- **Sign & Order:** Disabled until an account is selected and at least one test is in the order. When disabled, styling (e.g., opacity) and `aria-label` communicate why.
- **Order Summary:** Opens from the right pane; shows order details and tests for review before Submit & Print PDF.

### Visual & UX Consistency

- **Font:** Source Sans 3.
- **Primary blue:** `#3A5CE9` (buttons, links, focus).
- **Primary green:** `#3D9B3D` (success, Order Summary icon, pick list icon).
- **Validation/required red:** `#c62828` (NPI warning, NPI field error, OmniSeq required labels/controls, OmniSeq card warning).
- **Favorites star:** `#F7C93F`.
- **Custom tooltips** replace native tooltips; delete/trash icon uses a red-tinted tooltip.

---

## Technical Note

This is a **front-end prototype** (HTML, CSS, JavaScript). Data is in-memory or localStorage; no backend or real EHR integration. Suitable for demos, usability testing, and PM review of workflow and features.

---

## Summary Table

| Area              | Highlights |
|-------------------|------------|
| Search & discovery| Account-gated search, combobox, favorites, pick lists, recent orders, “Added” chips |
| Order Details     | Patient, provider, NPI (with Confirm NPI warning/red focus), bill method, order/collection dates |
| Test cards        | Inline diagnosis (ICD-10), specimen, fasting, special instructions; collapse; edit/remove |
| Edit sidebar      | Clinical Questions, Patient Status (all tests), OmniSeq-specific AOEs with required-field styling |
| OmniSeq card      | Red ⋯ and ⚠ until Edit sidebar opened once |
| Validation / UX   | Sign & Order gating, NPI focus/red stroke, red required fields, consistent colors and tooltips |
